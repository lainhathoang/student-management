export const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "studentId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "courseId",
        type: "uint256",
      },
    ],
    name: "CourseAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "studentId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "courseId",
        type: "uint256",
      },
    ],
    name: "CourseRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "studentId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "courseId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "grade",
        type: "uint256",
      },
    ],
    name: "GradeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "StudentAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      {
        indexed: false,
        internalType: "string",
        name: "detail",
        type: "string",
      },
    ],
    name: "StudentUpdated",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_id", type: "uint256" },
      { internalType: "uint256", name: "_courseId", type: "uint256" },
    ],
    name: "addCompletedCourse",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_id", type: "uint256" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "uint256", name: "_birthYear", type: "uint256" },
      { internalType: "string", name: "_managementClass", type: "string" },
    ],
    name: "addStudent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_id", type: "uint256" },
      { internalType: "uint256", name: "_courseId", type: "uint256" },
    ],
    name: "getCourseGrade",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
    name: "getStudentCompletedCourses",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
    name: "getStudentInfo",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "birthYear", type: "uint256" },
      { internalType: "string", name: "managementClass", type: "string" },
      {
        internalType: "uint256[]",
        name: "completedCourses",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalStudents",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_id", type: "uint256" },
      { internalType: "uint256", name: "_courseId", type: "uint256" },
    ],
    name: "removeCompletedCourse",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "students",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "birthYear", type: "uint256" },
      { internalType: "string", name: "managementClass", type: "string" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalStudents",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_id", type: "uint256" },
      { internalType: "uint256", name: "_newBirthYear", type: "uint256" },
    ],
    name: "updateBirthYear",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_id", type: "uint256" },
      { internalType: "uint256", name: "_courseId", type: "uint256" },
      { internalType: "uint256", name: "_grade", type: "uint256" },
    ],
    name: "updateCourseGrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_id", type: "uint256" },
      { internalType: "string", name: "_newClass", type: "string" },
    ],
    name: "updateManagementClass",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_oldId", type: "uint256" },
      { internalType: "uint256", name: "_newId", type: "uint256" },
    ],
    name: "updateStudentId",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_id", type: "uint256" },
      { internalType: "string", name: "_newName", type: "string" },
    ],
    name: "updateStudentName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
