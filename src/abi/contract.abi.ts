export const CONTRACT_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [{ internalType: "uint256", name: "maMonHoc", type: "uint256" }],
    name: "CourseNotCompleted",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "diem", type: "uint256" }],
    name: "InvalidGrade",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "start", type: "uint256" },
      { internalType: "uint256", name: "end", type: "uint256" },
    ],
    name: "InvalidRange",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "caller", type: "address" }],
    name: "NotOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "mssv", type: "uint256" }],
    name: "StudentAlreadyExists",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "mssv", type: "uint256" }],
    name: "StudentNotFound",
    type: "error",
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
      { indexed: true, internalType: "uint256", name: "mssv", type: "uint256" },
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
      { internalType: "uint256", name: "_mssv", type: "uint256" },
      { internalType: "uint256", name: "_maMonHoc", type: "uint256" },
      { internalType: "uint256", name: "_diem", type: "uint256" },
    ],
    name: "addCompletedCourse",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_mssv", type: "uint256" },
      { internalType: "string", name: "_ten", type: "string" },
      { internalType: "uint256", name: "_namSinh", type: "uint256" },
      { internalType: "string", name: "_lopQuanLy", type: "string" },
    ],
    name: "addStudent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_mssv", type: "uint256" }],
    name: "deleteStudent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_mssv", type: "uint256" }],
    name: "getCompletedCourses",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_mssv", type: "uint256" },
      { internalType: "uint256", name: "_maMonHoc", type: "uint256" },
    ],
    name: "getGradeForCourse",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_mssv", type: "uint256" }],
    name: "getStudentByMSSV",
    outputs: [
      { internalType: "uint256", name: "mssv", type: "uint256" },
      { internalType: "string", name: "ten", type: "string" },
      { internalType: "uint256", name: "namSinh", type: "uint256" },
      { internalType: "string", name: "lopQuanLy", type: "string" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "start", type: "uint256" },
      { internalType: "uint256", name: "end", type: "uint256" },
    ],
    name: "getStudentsInRange",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
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
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "students",
    outputs: [
      { internalType: "uint256", name: "mssv", type: "uint256" },
      { internalType: "string", name: "ten", type: "string" },
      { internalType: "uint256", name: "namSinh", type: "uint256" },
      { internalType: "string", name: "lopQuanLy", type: "string" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_newOwner", type: "address" }],
    name: "updateOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
