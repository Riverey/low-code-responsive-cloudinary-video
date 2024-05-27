//1.0.1
document.addEventListener("DOMContentLoaded", function () {
    const defaultBreakpoints = "1920, 1440, 1280, 992, 768, 480";

    const cloudName = (document.querySelector('[r-video_cloud-name]') || {}).getAttribute('r-video_cloud-name') || null;

    function generateBreakpoint(video) {
        const videoWidth = video.offsetWidth;
        let breakpoints = video.getAttribute("r-video_breakpoints");
        if (!breakpoints) {
            breakpoints = defaultBreakpoints;
        }
        breakpoints = breakpoints.split(',').map(bp => Number(bp.trim())).sort((a, b) => a - b);
        for (let i = 0; i < breakpoints.length; i++) {
            if (breakpoints[i] > videoWidth) {
                return breakpoints[i];
            }
        }
        return breakpoints[breakpoints.length - 1];
    }

    function UpdateVideo(video) {
        const newBreakpoint = generateBreakpoint(video);
        video.setAttribute('data-prev-breakpoint', newBreakpoint.toString());

        const videoId = video.getAttribute('r-video_id');
        const localCloudName = video.getAttribute('r-video_cloud-name') || cloudName || '';

        if (!localCloudName) {
            console.error(`Error: Cloud name is not provided for video with ID ${videoId}`);
            return;
        }

        let autoFormat = video.getAttribute('r-video_autoformat') ? (video.getAttribute('r-video_autoformat') === 'true' ? 'f_auto' : `f_${video.getAttribute('r-video_autoformat')}`) : 'f_auto';
        let autoQuality = video.getAttribute('r-video_autoquality') ? (video.getAttribute('r-video_autoquality') === 'true' ? 'q_auto' : `q_${video.getAttribute('r-video_autoquality')}`) : 'q_auto';

        const videoUrl = `https://res.cloudinary.com/${localCloudName}/video/upload/${autoFormat},${autoQuality}${newBreakpoint ? `,w_${newBreakpoint}` : ''}/${videoId}.webm`;
        const source = video.querySelector('source') || document.createElement('source');
        const lazyLoad = video.getAttribute('r-video_lazy-load') === 'true';

        const isPlaying = !video.paused || (video.getAttribute('autoplay') == true);

        if (lazyLoad) {
            source.setAttribute('data-src', videoUrl);
            source.setAttribute('type', 'video/webm');
            if (source.getAttribute('src')) {
                source.setAttribute('src', videoUrl);
                video.load();
            }
        }
        else {
            source.setAttribute('src', videoUrl);
            video.load();
        }
        if (!source.parentNode) {
            video.appendChild(source);
        }

        const autoPoster = video.getAttribute('r-video_autoposter') ? video.getAttribute('r-video_autoposter') : true;
        const posterImage = `https://res.cloudinary.com/${localCloudName}/video/upload/pg_1,w_${newBreakpoint},q_auto/${videoId}.webp`;

        if (autoPoster) {
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

    function init() {
        const videos = document.querySelectorAll('video[r-video_element]');

        videos.forEach(video => {
            UpdateVideo(video);
            console.log("Initialising the video");
        });

        window.addEventListener('resize', () => {
            videos.forEach(video => {
                const newBreakpoint = generateBreakpoint(video);                
                console.log("Updating the video, the breakpoint is " + newBreakpoint + ", old one is " + video.getAttribute('data-prev-breakpoint'));
                if (newBreakpoint != video.getAttribute('data-prev-breakpoint')) {
                    UpdateVideo(video);
                }
            });
        });
    }



    init();
});
