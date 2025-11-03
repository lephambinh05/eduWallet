// Quick test script to complete a course via API
const studentId = '690302badd7c9774cfd2a6a7';
const courseId = '6902fb55137fbb370d9a865a'; // COURSE_2_ID

const requestData = {
    studentId: studentId,
    progressPercent: 100,
    timeSpentSeconds: 1200, // 20 minutes
    completed: true
    // No quizScore - will default to 100
};

console.log('🧪 Testing course completion via API...\n');
console.log('Course ID:', courseId);
console.log('Student ID:', studentId);
console.log('Request data:', requestData);
console.log('\n');

fetch(`http://localhost:3001/api/partner/courses/${courseId}/progress`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
})
.then(response => {
    console.log('Response status:', response.status, response.statusText);
    return response.json();
})
.then(data => {
    console.log('\n📥 Response data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
        console.log('\n✅ SUCCESS! Course completed.');
        console.log('\nNow run: node check-completed-courses.js');
    } else {
        console.log('\n❌ FAILED:', data.message);
    }
})
.catch(error => {
    console.error('\n❌ ERROR:', error.message);
});
