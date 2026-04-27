function initGauge(gaugeBox, targetPercentage) {
    const gaugeFill = gaugeBox.querySelector('.gauge-fill');
    const percentageText = gaugeBox.querySelector('.percentage');
    const circumference = Math.PI * 60;
    
    gaugeFill.style.strokeDasharray = circumference;
    gaugeFill.style.strokeDashoffset = circumference;
    percentageText.textContent = '0%';
    
    setTimeout(function() {
        const offset = circumference * (1 - targetPercentage / 100);
        gaugeFill.style.strokeDashoffset = offset;
        
        let currentPercentage = 0;
        const duration = 1000;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = targetPercentage / steps;
        
        const counter = setInterval(function() {
            currentPercentage += increment;
            if (currentPercentage >= targetPercentage) {
                currentPercentage = targetPercentage;
                clearInterval(counter);
            }
            percentageText.textContent = currentPercentage.toFixed(1) + '%';
        }, stepTime);
    }, 100);
}

async function loadCounts() {
    try {
        const data = await Auth.fetchWithAuth('/courses');
        if (data.success) {
            const counts = {
                listening: data.courses.filter(c => c.category === 'listening').length,
                reading: data.courses.filter(c => c.category === 'reading').length,
                writing: data.courses.filter(c => c.category === 'writing').length,
                speaking: data.courses.filter(c => c.category === 'speaking').length
            };
            
            const elListening = document.getElementById('count-listening');
            const elReading = document.getElementById('count-reading');
            const elWriting = document.getElementById('count-writing');
            const elSpeaking = document.getElementById('count-speaking');

            if (elListening) elListening.textContent = `${counts.listening} Courses`;
            if (elReading) elReading.textContent = `${counts.reading} Courses`;
            if (elWriting) elWriting.textContent = `${counts.writing} Courses`;
            if (elSpeaking) elSpeaking.textContent = `${counts.speaking} Courses`;
        }
    } catch (err) {
        console.error('Failed to load counts:', err);
    }
}

document.addEventListener('DOMContentLoaded', function() {

    initGauge(document.querySelector('.gauge-box'), 87.6);
    loadCounts();
});
