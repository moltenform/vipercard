
/* auto */ import { checkThrow, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512BeginAsyncIgnoreFailures } from '../../ui512/utils/utilsTestCanvas.js';

/**
 * support the "play" command in vipercard
 */
export class VpcAudio {
    static isLoaded: { [key: string]: boolean } = {};

    /**
     * get url for a sound
     */
    static urlFromKey(key: string) {
        checkThrow(!scontains(key, '/'), 'K8|');
        checkThrow(!scontains(key, '\\'), 'K7|');
        checkThrow(key.match(/^[A-Za-z0-9_-]+$/), 'K6|');
        return `/resources/sound/${key}.mp3`;
    }

    /**
     * preload the sound, so that it will be
     * downloaded in the background and ready when needed
     * asynchronous
     *
     * note: safari seems to not let the sound work, as the audio element hasn't been 'interacted' with.
     */
    static preload(key: string) {
        if (!VpcAudio.isLoaded[key]) {
            let span = window.document.createElement('span');
            span.setAttribute('id', 'vpcaudiospan' + key);
            let url = VpcAudio.urlFromKey(key);

            span.innerHTML = `<audio class="notvisible" preload="auto" volume="0.2" id="vpcaudiohtmlel${key}">
            <source src="${url}" type="audio/mpeg" autoplay="0" autostart="0" volume="0.2" preload="auto"></audio>`;
            window.document.body.appendChild(span);
            VpcAudio.isLoaded[key] = true;
        }
    }

    /**
     * play the sound
     * asynchronous
     * will interrupt a sound that is currently playing
     */
    static play(key: string) {
        let aud = window.document.getElementById('vpcaudiohtmlel' + key) as HTMLAudioElement;
        if (aud) {
            aud.currentTime = 0;
            UI512BeginAsyncIgnoreFailures(() => aud.play());
            return true;
        } else {
            return false;
        }
    }

    /**
     * play system beep sound
     */
    static beep() {
        let aud = window.document.getElementById('vpcinitialaudio') as HTMLAudioElement;
        if (aud) {
            aud.currentTime = 0;
            UI512BeginAsyncIgnoreFailures(() => aud.play());
        }
    }
}
