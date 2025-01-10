// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentManagement {
    struct Student {
        uint256 mssv;
        string ten;
        uint256 namSinh;
        string lopQuanLy;
        uint256[] monHocDaHoanThanh;
        mapping(uint256 => uint256) diemMonHocDaHoanThanh; // mapping ma mon hoc da hoan thanh => diem mon hoc da hoan thanh
        bool exists; // sinh vien da ton tai chua
    }

    // mapping MSSV => Student
    mapping(uint256 => Student) public students;
    // luu tru danh sach sinh vien
    uint256[] private studentArray;

    address owner; // chu so huu smart contract

    event StudentAdded(uint256 indexed mssv);
    event StudentUpdated(uint256 indexed id, string detail);
    event CourseAdded(uint256 indexed studentId, uint256 courseId);
    event CourseRemoved(uint256 indexed studentId, uint256 courseId);
    event GradeUpdated(uint256 indexed studentId, uint256 courseId, uint256 grade);

    modifier onlyOwner() {
        require(msg.sender == owner, "Ban Khong phai la nguoi so huu smart contract");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // chuyen quyen so huu
    function updateOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    // Them moi student
    function addStudent(
        uint256 _mssv,
        string memory _ten,
        uint256 _namSinh,
        string memory _lopQuanLy
    ) public onlyOwner {
        // Kiem tra sinh vien da ton tai chua
        require(!students[_mssv].exists, "Sinh vien da ton tai");
        
        // Khai bao sinh vien moi & them vao mapping
        Student storage newStudent = students[_mssv];
        newStudent.mssv = _mssv;
        newStudent.ten = _ten;
        newStudent.namSinh = _namSinh;
        newStudent.lopQuanLy = _lopQuanLy;
        newStudent.exists = true;

        // Them sinh vien moi vao mang
        studentArray.push(_mssv);
        
        // Thong bao sinh vien moi duoc them
        emit StudentAdded(newStudent.mssv);
    }

    // Xoa sinh vien
    function deleteStudent(uint256 _mssv) public onlyOwner {
        // Kiem tra sinh vien ton tai
        require(students[_mssv].exists, "Sinh vien khong ton tai");

        // Xoa sinh vien khoi mapping
        delete students[_mssv];

        // Tim vi tri sinh vien trong mang
        for (uint256 i = 0; i < studentArray.length; i++) {
            if (studentArray[i] == _mssv) {
                // Di chuyen phan tu cuoi len vi tri can xoa
                studentArray[i] = studentArray[studentArray.length - 1];
                // Xoa phan tu cuoi
                studentArray.pop();
                break;
            }
        }

        // Thong bao sinh vien da xoa
        emit StudentUpdated(_mssv, "Deleted");
    }

    // Them mon hoc da hoan thanh va diem mon hoc
    function addCompletedCourse(uint256 _mssv, uint256 _maMonHoc, uint256 _diem) public onlyOwner {
        // Kiem tra sinh vien ton tai
        require(students[_mssv].exists, "Sinh vien khong ton tai");
        require(_diem >= 0 && _diem <= 10, "Diem phai nam trong khoang 0-10");

        // Lay thong tin sinh vien
        Student storage student = students[_mssv];
        
        // Kiem tra mon hoc da ton tai chua
        bool courseExists = false;
        for (uint256 i = 0; i < student.monHocDaHoanThanh.length; i++) {
            if (student.monHocDaHoanThanh[i] == _maMonHoc) {
                courseExists = true;
                break;
            }
        }

        // Them mon hoc moi vao mang neu mon hoc chua ton tai
        if (!courseExists) {
            student.monHocDaHoanThanh.push(_maMonHoc);
            emit CourseAdded(_mssv, _maMonHoc);
        }
        
        // Cap nhat diem
        student.diemMonHocDaHoanThanh[_maMonHoc] = _diem;
        emit GradeUpdated(_mssv, _maMonHoc, _diem);
    }

    // Lay thong tin sinh vien theo MSSV
    function getStudentByMSSV(uint256 _mssv) public view returns (
        uint256 mssv,
        string memory ten,
        uint256 namSinh,
        string memory lopQuanLy,
        bool exists
    ) {
        // Kiem tra sinh vien ton tai chua
        require(students[_mssv].exists, "Sinh vien khong ton tai");

        // Lay thong tin sinh vien
        Student storage student = students[_mssv];

        // Tra ve thong tin sinh vien
        return (
            student.mssv,
            student.ten,
            student.namSinh,
            student.lopQuanLy,
            student.exists
        );
    }

    // Lay so luong sinh vien trong khoang
    function getStudentsInRange(uint256 start, uint256 end) public view returns (uint256[] memory) {
        require(start <= end, "Start phai nho hon hoac bang End");
        require(end < studentArray.length, "End vuot qua so luong sinh vien");

        uint256 size = end - start + 1;
        uint256[] memory result = new uint256[](size);
        
        for(uint256 i = 0; i < size; i++) {
            result[i] = studentArray[start + i];
        }
        
        return result;
    }

    // Lay so luong sinh vien
    function getTotalStudents() public view returns (uint256) {
        return studentArray.length;
    }

    // Lay danh sach mon hoc da hoan thanh cua sinh vien
    function getCompletedCourses(uint256 _mssv) public view returns (uint256[] memory) {
        require(students[_mssv].exists, "Sinh vien khong ton tai");
        return students[_mssv].monHocDaHoanThanh;
    }

    // Lay diem mon hoc da hoan thanh cua sinh vien
    function getGradeForCourse(uint256 _mssv, uint256 _maMonHoc) public view returns (uint256) {
        require(students[_mssv].exists, "Sinh vien khong ton tai");
        
        Student storage student = students[_mssv];
        bool courseExists = false;
        
        for (uint256 i = 0; i < student.monHocDaHoanThanh.length; i++) {
            if (student.monHocDaHoanThanh[i] == _maMonHoc) {
                courseExists = true;
                break;
            }
        }
        
        require(courseExists, "Mon hoc chua duoc hoan thanh");
        return student.diemMonHocDaHoanThanh[_maMonHoc];
    }
}