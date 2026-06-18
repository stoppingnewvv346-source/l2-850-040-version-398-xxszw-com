(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setMessage(messageBox, message) {
        if (!messageBox) {
            return;
        }
        messageBox.textContent = message;
        messageBox.hidden = !message;
    }

    ready(function () {
        var player = document.querySelector('.js-player');
        if (!player) {
            return;
        }

        var source = player.getAttribute('data-m3u8');
        var overlay = document.querySelector('[data-player-trigger]');
        var messageBox = document.querySelector('[data-player-message]');
        var scrollButton = document.querySelector('[data-scroll-player]');
        var hlsInstance = null;

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function showOverlay() {
            if (overlay && player.paused) {
                overlay.classList.remove('is-hidden');
            }
        }

        function attachSource() {
            if (!source) {
                setMessage(messageBox, '当前影片暂未配置播放地址。');
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(player);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setMessage(messageBox, '播放源加载失败，请刷新页面后重试。');
                    }
                });
            } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
                player.src = source;
            } else {
                setMessage(messageBox, '当前浏览器需要加载 HLS 支持脚本后播放。');
            }
        }

        function playVideo() {
            hideOverlay();
            var promise = player.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    showOverlay();
                    setMessage(messageBox, '请再次点击播放按钮开始播放。');
                });
            }
        }

        attachSource();

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        if (scrollButton) {
            scrollButton.addEventListener('click', function () {
                player.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                playVideo();
            });
        }

        player.addEventListener('play', hideOverlay);
        player.addEventListener('pause', showOverlay);
        player.addEventListener('click', function () {
            if (player.paused) {
                playVideo();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
