'use babel';

import IsUpView from './isup-view';
import { CompositeDisposable } from 'atom';
import 'isomorphic-fetch';




class IsUpController {
  constructor() {
    // View and the modal panel inside it
    this.isUpView = new IsUpView();
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.isUpView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register commands
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'isup:Check Website': () => this.showDialog()
    }));

    this.subscriptions.add(atom.commands.add('.isup', {
      'isup:Hide Dialog': () => this.hideDialog(),
      'isup:Button Click': () => this.buttonClickHandler()
    }));

    // Form elementss
    this.button = this.modalPanel.getItem().querySelector('.isup-check-it-btn');
    this.input = this.modalPanel.getItem().querySelector('.isup-text');
    this.loading = this.modalPanel.getItem().querySelector('.isup-loading');

    this.button.addEventListener('click', this.buttonClickHandler);
    document.documentElement.addEventListener('click', this.outsideClickHandler);
  }

  deactivate() {
    document.documentElement.removeEventListener('click', this.outsideClickHandler);
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.isUpView.destroy();
  }

  showDialog() {
    if (!this.modalPanel.isVisible()) {
      this.modalPanel.show();
      this.input.focus();
    }
  }

  hideDialog(initiateState) {
    if (initiateState) {
      this.button.disabled = false;
      console.log(this.input.getModel());
      this.input.getModel().setText('');
    }
    if (this.modalPanel.isVisible()) {
      this.modalPanel.hide();
    }
  }

  buttonClickHandler = () => {
    const address = this.input.getModel().getText().replace(/https?:\/\//i, '');
    this.input.getModel().setText('');
    this.button.disabled = 'disabled';
    this.loading.classList.remove('hidden');
    this.checkWebsite(address);
  }

  outsideClickHandler = ev => {
    if (ev.target.closest('.isup') === null) {
      this.hideDialog();
    }
  };

  async checkWebsite(address) {
    if (!address) {
      return;
    }
    try {
      const response = await fetch(`https://isitup.org/${address}.json`);
      if (response.status >= 400) {
        // Oops!
        atom.notifications.addError('Oops! Server error!', {
          icon: 'alert',
          detail: response.toString()
        });
        console.error(response);
      }
      const data = await response.json();

      // Success
      if (data.status_code === 1) {
        const responseTime = data.response_time < 1
          ? `${data.response_time * 1000} ms`
          : `${data.response_time} s`;
        atom.notifications.addSuccess(`Yay! ${address} is up!`, {
          icon: 'rocket',
          detail: `It took ${responseTime} for a ${data.response_code} response code
with an IP of ${data.response_ip}.`
        });
      // Failed
      } else if (data.status_code === 2) {
        atom.notifications.addError(`Oops! Looks ${address} is down!`, {
          icon: 'bug',
        });
      // Invalid URI
      } else if (data.status_code === 3) {
        atom.notifications.addError('Oops! Invalid URI!', {
          icon: 'bug',
          detail: 'Invalid URI. Please recheck and make sure about it.'
        });
      }
    } catch (e) {
      atom.notifications.addError('Oops! Unknown error!', {
        icon: 'alert',
        dismissable: true,
        detail: e.toString()
      });
      console.error(e);
    } finally {
      this.hideDialog(true);
      this.loading.classList.add('hidden');
    }
  }
}


let controller = null;

export default {

  activate() {
    controller = new IsUpController();
  },

  deactivate() {
    controller.deactivate();
  }

};
