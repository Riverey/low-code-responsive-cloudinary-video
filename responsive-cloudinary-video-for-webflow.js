//1.0.7
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

    function calculateClosestRatio(aspectRatios, video) {
        const videoWidth = video.offsetWidth;
        const videoHeight = video.offsetHeight;
        const currentRatio = videoWidth / videoHeight;
        const ratios = aspectRatios.split(',').map(ratio => ratio.trim());
        let closestRatio = ratios[0];
        let minDiff = Math.abs(currentRatio - eval(ratios[0]));
        for (let i = 1; i < ratios.length; i++) {
            let diff = Math.abs(currentRatio - eval(ratios[i]));
            if (diff < minDiff) {
                minDiff = diff;
                closestRatio = ratios[i];
            }
        }
        console.log("Calculated ratio is " + closestRatio, " video with is " + videoWidth + "x" + videoHeight);
        return closestRatio;
    }

    function updateVideo(video) {
        const newBreakpoint = generateBreakpoint(video);
        video.setAttribute('data-prev-breakpoint', newBreakpoint.toString());

        const aspectRatios = video.getAttribute('r-video_aspect-ratios');
        let closestRatio = null;
        if (aspectRatios) {
            closestRatio = calculateClosestRatio(aspectRatios, video);
        }

        const videoId = video.getAttribute('r-video_id');
        const localCloudName = video.getAttribute('r-video_cloud-name') || cloudName || '';

        if (!localCloudName) {
            console.error(`Error: Cloud name is not provided for video with ID ${videoId}`);
            return;
        }

        let autoFormat = video.getAttribute('r-video_autoformat') ? (video.getAttribute('r-video_autoformat') === 'auto' ? 'f_auto' : `f_${video.getAttribute('r-video_autoformat')}`) : '';
        let autoQuality = video.getAttribute('r-video_autoquality') ? (video.getAttribute('r-video_autoquality') === 'auto' ? 'q_auto' : `q_${video.getAttribute('r-video_autoquality')}`) : '';

        let videoUrl = `https://res.cloudinary.com/${localCloudName}/video/upload/`;
        let parameters = [];
        if (autoFormat) parameters.push(autoFormat);
        if (autoQuality) parameters.push(autoQuality);
        if (newBreakpoint) parameters.push(`w_${newBreakpoint}`);
        if (closestRatio) parameters.push(`ar_${closestRatio}`);
        videoUrl += parameters.join(',');
        videoUrl += `/${videoId}`;
        
        const source = video.querySelector('source') || document.createElement('source');
        const lazyLoad = video.getAttribute('r-video_lazy-load') === 'true';

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
            updateVideo(video);
            console.log("Initialising the video");
        });

        window.addEventListener('resize', () => {
            videos.forEach(video => {
                const newBreakpoint = generateBreakpoint(video);                
                console.log("Updating the video, the breakpoint is " + newBreakpoint + ", old one is " + video.getAttribute('data-prev-breakpoint'));
                if (newBreakpoint > video.getAttribute('data-prev-breakpoint')) {
                    updateVideo(video); //only update if bigger than the previous breakpoint
                }
            });
        });
    }

    init();
});
