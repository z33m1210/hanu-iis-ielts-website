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

async function loadTopCourses() {
    const container = document.getElementById('topCoursesContainer');
    try {
        const data = await Auth.fetchWithAuth('/courses/top');
        if (data.success) {
            container.innerHTML = data.courses.map((c, i) => `
                <div class="c${i+1}" onclick="window.location.href='./course/index.html?id=${c.id}'" style="cursor:pointer">
                    <img src="./Rectangle 1080.png">
                    <p>${c.title}</p>
                    <p>By ${c.teacher.name}</p>
                    <div class="rtin">
                        <img src="./ratings.png">
                        <p>${c.ratingCount.toLocaleString()} Ratings</p>
                    </div>
                    <p>${c.hours} Total Hours. ${c.lectures} Lectures. ${c.level}</p>
                    <p>$${c.price}</p>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load top courses:', err);
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Failed to load courses.</p>';
    }
}

async function loadTopInstructors() {
    const container = document.getElementById('topInstructorsContainer');
    try {
        const data = await Auth.fetchWithAuth('/courses/instructors/top');
        if (data.success) {
            container.innerHTML = data.instructors.map((ins, i) => `
                <div class="ins${i+1}">
                    <img src="./Rectangle 1136.png">
                    <p>${ins.name}</p>
                    <p>${ins.title || 'IELTS Expert'}</p>
                    <div id="sep-line-ins"></div>
                    <div class="str-n-num">
                        <img src="./icon-1star.png">
                        <p>5.0</p>
                    </div>
                    <p>${ins.instructorStudents || '0'} students</p>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load top instructors:', err);
    }
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
            
            document.getElementById('count-listening').textContent = `${counts.listening} Courses`;
            document.getElementById('count-reading').textContent = `${counts.reading} Courses`;
            document.getElementById('count-writing').textContent = `${counts.writing} Courses`;
            document.getElementById('count-speaking').textContent = `${counts.speaking} Courses`;
        }
    } catch (err) {
        console.error('Failed to load counts:', err);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initGauge(document.querySelector('.gauge-box'), 87.6);
    loadTopCourses();
    loadTopInstructors();
    loadCounts();
});
