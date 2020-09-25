import { css, html, LitElement, property } from 'lit-element';
import * as openpgp from 'openpgp';

import { Router } from '@vaadin/router';

class ContactForm extends LitElement {
  @property({ type: String }) lang = '';
  @property({ type: Boolean }) english = true;
  @property({ type: Object }) saved = this.messageInput;

  @property({ attribute: false }) entooltip = html`Encrypted with&nbsp;

    <a href="https://en.wikipedia.org/wiki/Pretty_Good_Privacy" target="_blank">
      PGP</a
    >
    <span class="tooltiptext"
      >Messages are encrypted client-side with PGP using my public key. The
      message is sent directly to my email inbox where I simply decrypt it with
      my private key. This method is likely more secure than your email client!
      As long as you trust me. And fortunately, there's no added hassle. The
      form submits as easily as any other on the internet.</span
    >`;
  @property()
  jptooltip = html`<a href="https://ja.wikipedia.org/wiki/Pretty_Good_Privacy" target="_blank"
      >&#65328;&#65319;&#65328;</a
    >で暗号化<span class="tooltiptext"
      >メッセージはPGPでクライアント側で暗号化されます。受信トレイに届いたメッセージは簡単に復号化できます。これはおそらくあなたの電子メールクライアントよりも安全です！あなたが私を信頼する限り。</span
    ></span
  >`;

  firstUpdated() {
    if (location.pathname.includes('jp')) {
      this.english = false;
      this.lang = '/jp';
    } else {
      this.english = true;
      this.lang = '';
    }
    this.shadowRoot
      .getElementById('messageInput')
      .focus({ preventScroll: true });
    /* 
    const contactoutlet = this.shadowRoot?.getElementById('contactoutlet');
    const contactrouter = new Router(contactoutlet);
    contactrouter.setRoutes([
      { path: '/contact/success', component: 'contact-form' },
      { path: '/jp/contact', component: 'contact-form' },
      {
        path: '(.*)',
        redirect: '/',
      },
    ]); */
  }

  async encryptor() {
    await openpgp.initWorker({ path: 'openpgp.worker.js' });
    const publicKeyArmored = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: OpenPGP.js v4.10.7
Comment: https://openpgpjs.org

xjMEXvY7phYJKwYBBAHaRw8BAQdAzZqwHwdTp3PPQ0IFFSSYA/rydTouTzoH
uFTZ7XFnUyHNI2NvbnRhY3RAcC1rdS5jb20gPGNvbnRhY3RAcC1rdS5jb20+
wngEEBYKACAFAl72O6YGCwkHCAMCBBUICgIEFgIBAAIZAQIbAwIeAQAKCRBO
WAFxhEUl0zlaAQD42uAEk0g9VXN6mbjNsgrK5R4U5W0iHQTRmJwH3Q39DwEA
h2Sewbss0afGSfkkYm0DyOYYZa7saxclBPRqyoET6AvOOARe9jumEgorBgEE
AZdVAQUBAQdAzxnhfAgrXToXzTlzwniiNIOt+Cjj3m5dFMbyrOY4Y24DAQgH
wmEEGBYIAAkFAl72O6YCGwwACgkQTlgBcYRFJdMHFwEAsUudUgoDkTFz7ECq
cf+2tN4iEA7jNSUsKcxbtxOcYEsA/2SzrAVdtDH5RuSVYVVIvyHFALPybmVV
TComQBkFSpoM
=35BW
-----END PGP PUBLIC KEY BLOCK-----
`;
    const messageInput = (this.messageInput as HTMLInputElement).value;
    const { data: encrypted } = await openpgp.encrypt({
      message: openpgp.message.fromText(messageInput),
      publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys,
      privateKeys: [],
    });
    await openpgp.destroyWorker();
    return encrypted;
  }

  async sendMessage() {
    await this.encryptor().then(encrypted => {
      (this.pgp as HTMLInputElement).value = encrypted;
    });
    await (this.contact as HTMLFormElement).submit();
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      max-width: 960px;
      height: 100%;
      color: #321e00;
      /*       flex-grow: 1;
 */
      align-items: center;
      margin: 0 auto;
    }

    h2::selection {
      color: var(--white);
      background-color: #ef8127;
    }
    a::selection,
    span::selection {
      background: transparent;
    }

    .bearnecessities {
      opacity: 0;
      position: absolute;
      top: 0;
      left: 0;
      height: 0;
      width: 0;
      z-index: -1;
    }

    h2 {
      line-height: 1rem;
      text-align: left;
      margin-left: 1rem;
      justify-self: flex-start;
    }
    #col {
      display: flex;
      text-align: center;
      margin: 0 auto;
      justify-content: flex-start;
      width: 90%;
      height: 100%;
      text-align: center;
      flex-direction: column;
      max-width: 800px;
      flex-grow: 1;
    }
    textarea {
      box-sizing: border-box;
      resize: none;
      overflow: auto;
      width: 100%;
      border: solid #321e00 0.3em;
      border-radius: 1em 1em 0 1em;
      padding: 1em;
      font-family: inherit;
      color: var(--navbar);
      background: rgba(255, 253, 232, 0.8);
      font-size: calc(10px + 2vmin);
      flex: 0.5 1 auto;
      /*       box-shadow: 0px 0px 5px 1px inset;
 */
    }

    #buttonfoot {
      display: inline-flex;
      justify-content: space-between;
      width: 100%;
      position: relative;
      top: -1px;
    }

    button {
      background-color: var(--demobar);
      height: 1.7em;
      align-self: right;
      background-color: rgba(255, 253, 232, 0.8);
      color: var(--navbar);
      border-radius: 0 0 1rem 1rem;
      border: solid 0.3em var(--navbar);
      border-top: none;
      width: 4em;
      min-width: max-content;
      justify-content: right;
      align-items: right;
      position: relative;
      font-weight: 600;
      font-size: calc(10px + 2vmin);
      cursor: pointer;
    }
    #space {
      height: 2.5rem;
    }
    #tips {
      display: flex;
      font-size: calc(12px + 0.5vmin);
      cursor: default;
      height: 1.7rem;
    }
    .tooltip {
      display: inline-flex;
      text-decoration: underline dotted;
    }
    .infodot {
      text-decoration: none;
    }

    a {
      color: #ef8127;
    }
    .tooltip a {
      color: var(--navbar);
    }

    .tooltiptext {
      visibility: hidden;
      width: 70%;
      background-color: var(--navbar);
      color: var(--white);
      text-align: center;
      padding: 5px;
      border-radius: 2em 2em 2em 0;
      position: absolute;
      bottom: 5vw;
      left: 0.5rem;
    }
    #tips:hover .tooltiptext {
      visibility: visible;
    }

    .tooltip .tooltiptext::after {
      content: ' ';
      position: absolute;
      top: 100%; /* At the bottom of tooltip */
      left: 5px;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: var(--navbar) transparent transparent var(--navbar);
    }
  `;

  get messageInput() {
    return this.shadowRoot?.getElementById('messageInput');
  }
  get pgp() {
    return this.shadowRoot?.getElementById('pgp');
  }
  get contact() {
    return this.shadowRoot?.getElementById('contact');
  }

  render() {
    return html`
      <div id="col">
        <h2>${this.english ? 'Send a message.' : 'メッセージを送って。'}</h2>
        <form
          id="contact"
          name="contact"
          method="POST"
          netlify-honeypot="email"
          netlify
          action="/success"
        >
          <input type="hidden" name="form-name" value="contact" />
          <label class="bearnecessities"><input name="email" /></label>
          <input name="visitorMessage" id="pgp" type="hidden" />
        </form>
        <textarea
          name="message"
          id="messageInput"
          placeholder=${this.english
            ? "Is there anything you'd like to tell me?"
            : '伝えたいことはありますか？'}
          type="text"
        ></textarea>
        <div id="buttonfoot">
          <div id="tips">
            <span class="infodot">★</span
            ><span class="tooltip"
              >${this.english ? this.entooltip : this.jptooltip}</span
            >
          </div>
          <button @click=${this.sendMessage}>
            ${this.english ? 'send' : '送る'}
          </button>
        </div>
        <div id="space"></div>
      </div>
    `;
  }
}

customElements.define('contact-form', ContactForm);
