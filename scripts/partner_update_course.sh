#!/bin/bash
set -e
COURSE_ID="quiz_1762644449294_re1m0z22q"
TS=$(date +%s)
OUT="/www/wwwroot/partner1.mojistudio.vn/public/course-backup-${COURSE_ID}-${TS}.json"
echo "Exporting course $COURSE_ID to $OUT"
mongoexport --db=partner1_video_db --collection=courses --query "{\"courseId\":\"${COURSE_ID}\"}" --out="$OUT" && echo "exported: $OUT" || { echo "mongoexport failed"; exit 1; }
echo "Running mongosh update to fill options/ids"
/usr/bin/mongosh partner1_video_db --quiet --eval "const cid='${COURSE_ID}'; const doc=db.courses.findOne({courseId:cid}); if(!doc){print('NOT_FOUND'); process.exit(1);} let changed=false; doc.quiz.questions.forEach((q,i)=>{ if(!q.options||q.options.length===0){q.options=['Option A','Option B','Option C','Option D']; changed=true;} if(!q.id){q.id=i+1; changed=true;} if(q.correctAnswer===undefined||q.correctAnswer===null){q.correctAnswer=0; changed=true;} }); if(changed){ db.courses.updateOne({courseId:cid},{\$set:{'quiz.questions':doc.quiz.questions}}); print('UPDATED'); } else {print('NO_CHANGE'); }"

echo "Done"
