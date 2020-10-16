class EasyRtcWC extends HTMLElement {
  static get observedAttributes(){
    return ['room']
  }
  constructor() {
    super();
    this.removeConnectButton = this.removeConnectButton.bind(this)
    this.innerHTML = this.html();
  }

  html(){
    return `
      <style id="easyrtcwc-styles">${this.css()}</style>
      <div id="easyrtcwc-container">
        <div id="easyrtcwc-connectButtonContainer"></div>
        <video id="easyrtcwc-self"></video>
        <video id="easyrtcwc-caller"></video>
        <div class="easyrtc_closeButton"></div>
      </div>
    `
  }

  css(){
    return `      
      #easyrtcwc-container {
        width: 100%;
        height: 100%;
        position: relative;
        background-color: #333;
      }

      #easyrtcwc-self {
        width: 20%;
        height: 20%;
        object-fit: cover;
        position: absolute;
        top: 10px;
        right: 10px;
        border: 1px solid #555;
      }

      #easyrtcwc-caller {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      #easyrtcwc-connectButtonContainer {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 100;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      #easyrtcwc-connectButtonContainer button {
        padding: 10px 15px;       
        border-radius: 12px;
        border: 1px solid #111;
        background-color: #222;
        color: white;  
        letter-spacing: 2px;
        font-family: Helvetica;
        outline: none;
      }

      #easyrtcwc-connectButtonContainer button:focus, #easyrtcwc-connectButtonContainer button:hover {
        opacity: 0.8;
      }

      #easyrtcErrorDialog {
        background-color: #ffe0e0;

        position:fixed;
        right: 10px;
        top:20px;
        z-index: 200;
        opacity: 0.95;
        padding: 0.5em;
        border-radius:10px;
        border-color: red;
        border-style: solid;
        border-width: 1px;
       -webkit-box-shadow: 2px 2px 8px 1px rgba(0,0,0,0.9);
        box-shadow: 2px 2px 8px 1px rgba(0,0,0,0.9);
      }

      .easyrtcErrorDialog_title {
        position:static;
        text-align:center;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 0.5em;
        clear:both;
      }

      #easyrtcErrorDialog_body{
        position:static;
        height:150px;
        overflow-y:auto;
      }

      .easyrtcErrorDialog_element {
        position:static;
        font-style: italic;
        font-size: 12px;
        width:300px;
        margin-bottom: 0.5em;
        clear: both;
        float:left;
      }

      .easyrtcErrorDialog_okayButton {
        position:static;
        clear:both;
        float:right;
      }

      .easyrtcMirror {
        -webkit-transform: scaleX(-1);
        -moz-transform: scaleX(-1);
        -ms-transform: scaleX(-1);
        -o-transform: scaleX(-1);
        transform: scaleX(-1);
      }

      .easyrtc_closeButton {
        z-index: 2;
        position: absolute;
        width: 40px;
        height:40px;
        right: 0px;
        top: 0px;
        background-image: url('data:image/svg+xml;utf8,<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g stroke="#b0b0b0" stroke-width="7" ><g>    <path  d="M76.03,79.854c-0.979,0-1.958-0.373-2.704-1.12L21.184,26.592c-1.494-1.494-1.494-3.915,0-5.409c1.494-1.493,3.915-1.493,5.409,0l52.143,52.142c1.494,1.494,1.494,3.915,0,5.409C77.988,79.481,77.01,79.854,76.03,79.854z"/></g><g><path d="M23.888,79.854c-0.979,0-1.958-0.373-2.704-1.12c-1.494-1.494-1.494-3.915,0-5.409l52.142-52.142c1.493-1.493,3.915-1.493,5.409,0c1.494,1.494,1.494,3.915,0,5.409L26.593,78.734C25.846,79.481,24.867,79.854,23.888,79.854z"/></g></g><g fill="#000000"><g><path  d="M76.03,79.854c-0.979,0-1.958-0.373-2.704-1.12L21.184,26.592c-1.494-1.494-1.494-3.915,0-5.409c1.494-1.493,3.915-1.493,5.409,0l52.143,52.142c1.494,1.494,1.494,3.915,0,5.409C77.988,79.481,77.01,79.854,76.03,79.854z"/></g><g><path d="M23.888,79.854c-0.979,0-1.958-0.373-2.704-1.12c-1.494-1.494-1.494-3.915,0-5.409l52.142-52.142c1.493-1.493,3.915-1.493,5.409,0c1.494,1.494,1.494,3.915,0,5.409L26.593,78.734C25.846,79.481,24.867,79.854,23.888,79.854z"/></g></g></svg>');
        opacity: 0.3;
      }

      .easyrtc_closeButton:hover {
        opacity: 1;
      }
    `
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue) {
      this.initialize_video(newValue)
    }
  }

  initialize_video(roomName) {
    easyrtc.setRoomOccupantListener(this.loggedInListener.bind(this));
    easyrtc.enableAudio(true);
    easyrtc.enableVideo(true);
    easyrtc.joinRoom(roomName, null,
      () => console.log('connected to room', window.location.href),
      () => console.error('failed to connect to room ', window.location.href))
    easyrtc.easyApp("vidchess", "easyrtcwc-self", ["easyrtcwc-caller"], function(myId) {
      console.log("My easyrtcid is " + myId);
    });
    easyrtc.setPeerOpenListener(() => this.removeConnectButton());
  }

  removeConnectButton(){
    const connectButtonContainer = document.getElementById('easyrtcwc-connectButtonContainer');
    while (connectButtonContainer.firstChild) {
      connectButtonContainer.removeChild(connectButtonContainer.firstChild);
    }
  }

  loggedInListener(roomName, otherPeers, selfInto){
    console.log('#### ROOM NAME #####', roomName)
    console.log('#### OTHER PEERS #####', otherPeers)
    console.log('#### SELF INFO #####', selfInto)
    this.removeConnectButton()

    for(var i in otherPeers) {
      var button = document.createElement('button');
      button.onclick = (easyrtcid => {
        return () => {
          this.performCall(easyrtcid);
          button.remove()
        }
      })(i);
      const label = document.createTextNode('START VIDEO');
      button.appendChild(label);
      const connectButtonContainer = document.getElementById('easyrtcwc-connectButtonContainer');
      connectButtonContainer.appendChild(button);
    }
  }

  performCall(easyrtcid){
    easyrtc.call(
      easyrtcid,
      easyrtcid => console.log("completed call to " + easyrtcid),
      errorMessage => console.log("err:" + errorMessage),
      (accepted, bywho) => console.log((accepted?"accepted":"rejected")+ " by " + bywho)
    );
  }
}

customElements.define('easyrtc-wc', EasyRtcWC);