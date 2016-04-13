'use babel';

export default class IsUpView {

  constructor() {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('isup');

    const form = `
<div class='block'>
  <label class='text-highlight isup icon icon-globe'>Website Address:</label>
  <atom-text-editor placeholder-text='github.com' class='isup isup-text' mini></atom-text-editor>
  <button class='isup btn btn-primary btn-small isup-check-it-btn'>Check It!</button>
  <span class='isup isup-loading hidden loading loading-spinner-small inline-block'></span>
</div>`;
    this.element.innerHTML = form;
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
