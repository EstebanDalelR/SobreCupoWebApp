import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const Profiles = new Mongo.Collection('profiles');

if (Meteor.isServer) {
  Meteor.publish('profiles', profile => {
    if (!profile)
      return [];
    return Profiles.find({ name: profile });
  });
}

Meteor.methods({
  'profiles.reportOccupied'(classroom) {

    if (!Meteor.user()) return new Meteor.Error('Unauthorized');

    //Checking date in server to avoid arbitraty injection

    const servDate = new Date();

    let hours = servDate.getHours();
    let minutes = servDate.getMinutes();
    let start = hours * 100 + minutes;
    let end = Math.min(2359, (hours + 1) * 100 + minutes);
    if (start < 1000) start = '0' + start;
    if (end < 1000) end = '0' + end;

    let dd = servDate.getDate();
    let mm = servDate.getMonth() + 1;
    let yy = servDate.getFullYear().toString().substr(-2);
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const date = dd + '-' + mm + '-' + yy;
    const timestamp = Date.now();

    Profiles.upsert({ name: Meteor.user().username },
      {
        $push: {
          history: {
            date, type: 'occupied', classroom, start, end, timestamp
          }
        }
      }
    );
  },
  'profiles.upvote'() {
    if (!Meteor.user()) {
      throw new Meteor.Error('Not authorized');
    }
    Profiles.upsert({ name: Meteor.user().username }, 
      {$inc: {upvotes: 1}}
    );
  },
  'profiles.reportFree'({ date, classroom, schedule }) {
    const timestamp = Date.now();
    if (!Meteor.user()) {
      throw new Meteor.Error('Not authorized');
    }
    Profiles.upsert({ name: Meteor.user().username },
      {
        $push: {
          history: {
            date, type: 'free', classroom, start: schedule.start, end: schedule.end, timestamp
          }
        }
      });
  }
});
