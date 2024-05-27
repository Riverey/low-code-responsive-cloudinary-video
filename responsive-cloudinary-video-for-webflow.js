document.addEventListener("DOMContentLoaded", function () {
    const defaultBreakpoints = "1919/1919, 1439/1439, 1279/1279, 991/991, 767/767, 479/479";

    function parseBreakpoints(breakpointStr) {
        return breakpointStr.split(',').map(bp => {
            const [minWidth, videoWidth] = bp.trim().split('/').map(Number);
            return { minWidth, videoWidth };
        });
    }

    function getVideoWidth(breakpoints, containerWidth) {
        for (const bp of breakpoints) {
            if (containerWidth <= bp.minWidth) {
                return bp.videoWidth;
            }
        }
        return ''; // Return empty string if no breakpoint matches
    }

    function updateVideoAndPoster(video, cloudName) {
        const container = video.getAttribute('r-video_element');
        let containerWidth;
        if (container === 'viewport') {
            containerWidth = window.innerWidth;
        } else if (container === 'self') {
            containerWidth = video.offsetWidth;
        }

        const breakpointsAttr = video.getAttribute('r-video_breakpoints');
        const breakpoints = parseBreakpoints(breakpointsAttr || defaultBreakpoints);

        const videoWidth = getVideoWidth(breakpoints, containerWidth);

        if (videoWidth.toString() === video.getAttribute('data-video-width')) {
            return;
        }

        video.setAttribute('data-video-width', videoWidth.toString());

        const videoId = video.getAttribute('r-video_id');
        const cloudNameOverride = video.getAttribute('r-video_cloud-name') || cloudName || '';

        if (!cloudNameOverride) {
            console.error(`Error: Cloud name is not provided for video with ID ${videoId}`);
            return;
        }

        let autoFormat = video.getAttribute('r-video_autoformat') !== 'false' ? (video.getAttribute('r-video_autoformat') === 'true' ? 'f_auto' : `f_${video.getAttribute('r-video_autoformat')}`) : 'f_auto';
        let autoQuality = video.getAttribute('r-video_autoquality') !== 'false' ? (video.getAttribute('r-video_autoquality') === 'true' ? 'q_auto' : `q_${video.getAttribute('r-video_autoquality')}`) : 'q_auto';

        const videoUrl = `https://res.cloudinary.com/${cloudNameOverride}/video/upload/${autoFormat},${autoQuality}${videoWidth ? `,w_${videoWidth}` : ''}/${videoId}.mp4`;
        const source = video.querySelector('source') || document.createElement('source');
        const lazyLoad = video.getAttribute('r-video_lazy-load') === 'true';

        if (lazyLoad) {
            source.setAttribute('data-src', videoUrl);
            if (source.getAttribute('src')) {
                source.setAttribute('src', videoUrl);
            }
        }
        else {
            source.setAttribute('src', videoUrl);
        }
        if (!source.parentNode) {
            video.appendChild(source);
        }

        const autoPoster = video.getAttribute('r-video_autoposter');
        const posterImage = `https://res.cloudinary.com/${cloudNameOverride}/video/upload/pg_1,w_${videoWidth},q_auto/${videoId}.webp`;

        if (!autoPoster) {
            if (lazyLoad) {
                video.setAttribute('data-poster', posterImage);
                if (video.getAttribute('poster')) {
                    video.setAttribute('poster', posterImage);
                }
            }
            else {
                video.setAttribute('poster', posterImage);
            }
        }
    }

    function initVideoOptimization(cloudName) {
        const videos = document.querySelectorAll('video[r-video_element]');

        videos.forEach(video => {
            updateVideoAndPoster(video, cloudName);
        });

        window.addEventListener('resize', () => {
            videos.forEach(video => {
                updateVideoAndPoster(video, cloudName);
            });
        });
    }

    // Get cloud name from the DOM element with attribute "r-video_cloud-name"
    const cloudNameElement = document.querySelector('[r-video_cloud-name]');
    const cloudName = cloudNameElement ? cloudNameElement.getAttribute('r-video_cloud-name') : '';

    initVideoOptimization(cloudName);
});
