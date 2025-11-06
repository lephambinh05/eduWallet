/**
 * Seed sample courses (video and quiz) into partner database
 * Run: node scripts/seed-courses.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

// Course Schema
const CourseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  issuer: String,
  category: String,
  level: String,
  credits: Number,
  courseType: {
    type: String,
    enum: ["video", "quiz", "hybrid"],
    default: "video",
  },

  // Video-specific fields
  videoId: String,
  videoDuration: Number,

  // Quiz-specific fields
  quiz: {
    questions: [
      {
        id: Number,
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
      },
    ],
    passingScore: { type: Number, default: 70 },
    timeLimit: Number,
  },

  skills: [String],
  link: String,
  priceEdu: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Course = mongoose.model("Course", CourseSchema);

// Sample courses data
const sampleCourses = [
  // VIDEO COURSE
  {
    courseId: "video_js_basics_2024",
    title: "JavaScript Fundamentals",
    description:
      "Learn the basics of JavaScript programming including variables, functions, and control structures.",
    issuer: "TechEdu Academy",
    category: "Programming",
    level: "Beginner",
    credits: 3,
    courseType: "video",
    videoId: "PkZNo7MFNFg", // JavaScript tutorial video
    videoDuration: 3600, // 60 minutes
    skills: ["JavaScript", "Programming", "Web Development"],
    link: "https://partner1.mojistudio.vn/course/video_js_basics_2024",
    priceEdu: 50,
  },

  // QUIZ COURSE
  {
    courseId: "quiz_react_advanced_2024",
    title: "React Advanced Concepts Quiz",
    description:
      "Test your knowledge of advanced React concepts including hooks, context, and performance optimization.",
    issuer: "TechEdu Academy",
    category: "Programming",
    level: "Advanced",
    credits: 2,
    courseType: "quiz",
    quiz: {
      questions: [
        {
          id: 1,
          question: "What is the purpose of React Hooks?",
          options: [
            "To add lifecycle methods to class components",
            "To use state and other React features in functional components",
            "To create custom HTML elements",
            "To optimize component rendering",
          ],
          correctAnswer: 1,
          explanation:
            "React Hooks allow you to use state and other React features without writing a class component.",
        },
        {
          id: 2,
          question: "Which hook is used for side effects in React?",
          options: ["useState", "useContext", "useEffect", "useMemo"],
          correctAnswer: 2,
          explanation:
            "useEffect is the hook used to perform side effects in functional components, similar to componentDidMount, componentDidUpdate, and componentWillUnmount in class components.",
        },
        {
          id: 3,
          question: "What does the useMemo hook do?",
          options: [
            "Stores component state",
            "Handles side effects",
            "Memoizes expensive calculations",
            "Creates context providers",
          ],
          correctAnswer: 2,
          explanation:
            "useMemo memoizes the result of expensive calculations and only recalculates when dependencies change.",
        },
        {
          id: 4,
          question: "What is the virtual DOM in React?",
          options: [
            "A copy of the actual DOM stored in memory",
            "A new HTML specification",
            "A JavaScript library",
            "A CSS framework",
          ],
          correctAnswer: 0,
          explanation:
            "The virtual DOM is a lightweight copy of the actual DOM that React uses to optimize rendering by minimizing direct DOM manipulations.",
        },
        {
          id: 5,
          question: "Which method is used to update state in class components?",
          options: [
            "this.updateState()",
            "this.setState()",
            "this.changeState()",
            "this.modifyState()",
          ],
          correctAnswer: 1,
          explanation:
            "this.setState() is the method used to update component state in React class components.",
        },
        {
          id: 6,
          question: "What is prop drilling in React?",
          options: [
            "A method to optimize performance",
            "Passing props through multiple layers of components",
            "A debugging technique",
            "A way to create custom hooks",
          ],
          correctAnswer: 1,
          explanation:
            "Prop drilling refers to passing props through multiple intermediate components that don't use the props themselves, just to get them to a deeply nested component.",
        },
        {
          id: 7,
          question: "What is the purpose of React.memo()?",
          options: [
            "To store component state",
            "To prevent unnecessary re-renders of functional components",
            "To create context providers",
            "To handle side effects",
          ],
          correctAnswer: 1,
          explanation:
            "React.memo() is a higher-order component that prevents re-rendering of a functional component if its props haven't changed.",
        },
        {
          id: 8,
          question: "What does the useCallback hook return?",
          options: [
            "A memoized value",
            "A memoized callback function",
            "Component state",
            "Context value",
          ],
          correctAnswer: 1,
          explanation:
            "useCallback returns a memoized version of the callback function that only changes if dependencies change.",
        },
        {
          id: 9,
          question: "What is the useReducer hook used for?",
          options: [
            "To reduce bundle size",
            "To manage complex state logic",
            "To optimize rendering",
            "To create custom hooks",
          ],
          correctAnswer: 1,
          explanation:
            "useReducer is used to manage complex state logic, similar to Redux, providing a predictable way to update state.",
        },
        {
          id: 10,
          question: "What is React Context used for?",
          options: [
            "To style components",
            "To share data across component tree without prop drilling",
            "To handle HTTP requests",
            "To create animations",
          ],
          correctAnswer: 1,
          explanation:
            "React Context provides a way to pass data through the component tree without having to pass props manually at every level.",
        },
      ],
      passingScore: 70,
      timeLimit: 900, // 15 minutes
    },
    skills: ["React", "JavaScript", "Frontend Development", "Hooks"],
    link: "https://partner1.mojistudio.vn/course/quiz_react_advanced_2024",
    priceEdu: 30,
  },

  // HYBRID COURSE (Video + Quiz)
  {
    courseId: "hybrid_python_basics_2024",
    title: "Python Programming Complete Course",
    description:
      "Complete Python course with video lessons and knowledge assessment quiz.",
    issuer: "TechEdu Academy",
    category: "Programming",
    level: "Beginner",
    credits: 5,
    courseType: "hybrid",
    videoId: "rfscVS0vtbw", // Python tutorial video
    videoDuration: 4500, // 75 minutes
    quiz: {
      questions: [
        {
          id: 1,
          question: "What is the correct way to declare a variable in Python?",
          options: ["var x = 5", "x = 5", "int x = 5", "let x = 5"],
          correctAnswer: 1,
          explanation:
            "In Python, you simply assign a value to a variable name without declaring a type.",
        },
        {
          id: 2,
          question: "Which data type is mutable in Python?",
          options: ["tuple", "string", "list", "int"],
          correctAnswer: 2,
          explanation:
            "Lists are mutable in Python, meaning you can change their contents after creation.",
        },
        {
          id: 3,
          question: "What does the len() function do?",
          options: [
            "Returns the length of an object",
            "Returns the last element",
            "Returns the first element",
            "Returns the type of object",
          ],
          correctAnswer: 0,
          explanation:
            "len() returns the number of items in an object like a string, list, or tuple.",
        },
        {
          id: 4,
          question: "How do you start a function definition in Python?",
          options: [
            "function myFunc():",
            "def myFunc():",
            "func myFunc():",
            "define myFunc():",
          ],
          correctAnswer: 1,
          explanation:
            'Functions in Python are defined using the "def" keyword.',
        },
        {
          id: 5,
          question: "What is the output of print(type([]))?",
          options: [
            "<class 'tuple'>",
            "<class 'dict'>",
            "<class 'list'>",
            "<class 'set'>",
          ],
          correctAnswer: 2,
          explanation:
            "[] creates an empty list, so type([]) returns <class 'list'>.",
        },
      ],
      passingScore: 60,
      timeLimit: 600, // 10 minutes
    },
    skills: ["Python", "Programming", "Backend Development"],
    link: "https://partner1.mojistudio.vn/course/hybrid_python_basics_2024",
    priceEdu: 80,
  },
];

// Connect and seed
async function seedCourses() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    console.log("\n🌱 Seeding courses...");

    // Clear existing courses (optional)
    // await Course.deleteMany({});
    // console.log('🗑️  Cleared existing courses');

    // Insert sample courses
    for (const courseData of sampleCourses) {
      try {
        // Check if course already exists
        const existing = await Course.findOne({
          courseId: courseData.courseId,
        });
        if (existing) {
          console.log(
            `⏭️  Course "${courseData.title}" already exists, skipping...`
          );
          continue;
        }

        const course = new Course(courseData);
        await course.save();
        console.log(
          `✅ Created course: ${courseData.title} (${courseData.courseType})`
        );
      } catch (error) {
        console.error(
          `❌ Error creating course "${courseData.title}":`,
          error.message
        );
      }
    }

    console.log("\n✨ Seeding completed!");
    console.log(`📊 Total courses: ${await Course.countDocuments()}`);

    // Display summary
    console.log("\n📋 Course Summary:");
    const courses = await Course.find().sort({ courseType: 1, title: 1 });
    courses.forEach((c) => {
      console.log(`   • ${c.title} (${c.courseType}) - ${c.courseId}`);
    });

    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run seeding
seedCourses();
