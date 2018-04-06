
/* auto */ import { checkThrow, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512BeginAsyncIgnoreFailures } from '../../ui512/utils/utilsTestCanvas.js';

export class VpcAudio {
    static isLoaded: { [key: string]: boolean } = {};
    static unloadAll() {
        // not implemented yet
    }

    static urlFromKey(key: string) {
        checkThrow(!scontains(key, '/'), '');
        checkThrow(!scontains(key, '\\'), '');
        checkThrow(key.match(/^[A-Za-z0-9_-]+$/), '');
        return `/resources/sound/${key}.mp3`;
    }

    static preload(key: string) {
        if (!VpcAudio.isLoaded[key]) {
            let span = window.document.createElement('span');
            span.setAttribute('id', 'vpc_audio_span_' + key);
            let url = VpcAudio.urlFromKey(key);
            // note: we could also volume set to 0.0001 so it won't always play it
            span.innerHTML = `<audio class="notvisible" preload="auto" volume="0.2" id="vpc_audio_${key}">
            <source src="${url}" type="audio/mpeg"  autoplay="0" autostart="0" volume="0.2" preload="auto"></audio>`;
            window.document.body.appendChild(span);
            VpcAudio.isLoaded[key] = true;
        }
    }

    static play(key: string) {
        let aud = window.document.getElementById('vpc_audio_' + key) as HTMLAudioElement;
        if (aud) {
            aud.currentTime = 0;
            UI512BeginAsyncIgnoreFailures(() => aud.play());
            return true;
        } else {
            return false;
        }
    }

    static beep() {
        let aud = window.document.getElementById('vpc_initial_audio') as HTMLAudioElement;
        if (aud) {
            aud.currentTime = 0;
            UI512BeginAsyncIgnoreFailures(() => aud.play());
        }
    }
}
