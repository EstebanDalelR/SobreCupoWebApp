import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import './FreeClassroom.css';

class FreeClassroom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reporting: false,
      confirming: false,
      confirmedUpvote: this.props.classroom.wasUpvoted,
      confirmedReport: false,
      errorMessage: '',
      successMessage: ''
    };
  }

  formatClassroomName(classroom) {
    const formattedName = classroom.substr(1).split('_').join(' ');
    return formattedName;
  }

  reportOccupied() {

    this.setState({ errorMessage: '' });

    const name = this.props.classroom.name;
    const reason = this.input.value;

    if (!reason) {
      this.setState({ errorMessage: 'Es necesario incluir un motivo para reportar el salón' });
      return;
    }

    Meteor.call('classrooms.reportOccupied', name, (err) => {
      if (err) {this.setState({ errorMessage: err.message }); return;}
      this.setState({reporting: false, confirmedReport: true, successMessage: 'Reporte enviado'});
    });

    Meteor.call('profiles.reportOccupied', name, (err) => {
      if (err) this.setState({ errorMessage: err.message });
    });
  }

  generateUserReportList(reportList) {
    let str = '';

    for (const report of reportList) {
      str += report.user + ', ';
    }

    return str.substr(0, str.length - 2);
  }

  confirmClassroom() {
    this.setState({confirming: true});
    Meteor.call('classrooms.upvote', this.props.classroom.name, (err) => {
      if (err) {this.setState({ errorMessage: err.message, confirming: false }); return;}
      this.setState({confirmedUpvote: true, successMessage: '¡Voto registrado!'});
    });
  }

  hasUserSentReport(){
    for(const report of this.props.classroom.occupiedReports){
      if(report.user === this.props.user.username)
        return true;
    }
    return false;
  }

  render() {
    return (
      <li className='free-classroom-container'>
        <strong>
          {this.formatClassroomName(this.props.classroom.name)}
        </strong>
        <p>
          {this.props.classroom.minutesLeft}
        </p>
        {this.props.classroom.occupiedReports.length > 0 ?
          <p className='error-message'>
            Este salón fue reportado ocupado por: {this.generateUserReportList(this.props.classroom.occupiedReports)}
          </p> : null}
        <div className='icons-container'>
          <div className='icon'>
            <i className={this.state.confirmedReport || this.hasUserSentReport() ? 'material-icons disabled': 'material-icons'}
              onClick={() => this.state.confirmedReport || this.hasUserSentReport() ? null : this.setState({ reporting: !this.state.reporting })}>
              error_outline
            </i>
            <small>Reportar</small>
            <span>
              Este salón no está disponible...
            </span>
          </div>
          <div className='icon'>
            <i className={this.state.confirmedUpvote ? 'material-icons disabled': 'material-icons'}
              onClick={() => this.state.confirmedUpvote ? null : this.confirmClassroom()}>
              check_circle_outline
            </i>
            <small className={this.state.confirmedUpvote ? 'disabled': null}>Confirmar</small>
            <span>
              ¡Este salón está disponible!
            </span>
          </div>
        </div>
        {this.state.reporting ?
          <div>
            {this.props.user ?
              <div>
                <h4>Reportar salón ocupado</h4>
                <p>¿Por qué el salón está ocupado?</p>
                <input type="text" ref={ref => this.input = ref} placeholder='(Reserva) Monitoría de cálculo diferencial' />
                <button onClick={() => this.reportOccupied()}>Enviar</button>
              </div> :
              <div>
                <p>Únicamente los usuarios pueden reportar salones. <a href="/access">Inicia sesión</a></p>
              </div>
            }
          </div> : null}

        {this.state.confirming ?
          <div>
            {this.props.user ?
              null :
              <div>
                <p>Únicamente los usuarios pueden confirmar salones. <a href="/access">Inicia sesión</a></p>
              </div>
            }
          </div> : null}

        {this.state.errorMessage ?
          <p className='error-message'>{this.state.errorMessage}</p>
          : null}
        {this.state.successMessage ?
          <p className='success-message'>{this.state.successMessage}</p>
          : null}
        <small className='classroom-score'>
          +{this.props.classroom.upvotes}
        </small>
      </li>
    );
  }
}

FreeClassroom.propTypes = {
  classroom: PropTypes.object.isRequired,
  user: PropTypes.object
};

export default FreeClassroom;