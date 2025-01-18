// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentManagement {
    // Custom errors
    error StudentAlreadyExists(uint256 mssv); // Lỗi khi sinh viên đã tồn tại
    error StudentNotFound(uint256 mssv); // Lỗi khi sinh viên không tồn tại
    error InvalidGrade(uint256 diem); // Lỗi khi điểm không hợp lệ
    error CourseNotCompleted(uint256 maMonHoc); // Lỗi khi môn học chưa hoàn thành
    error NotOwner(address caller); // Lỗi khi người gọi không phải là owner
    error InvalidRange(uint256 start, uint256 end); // Lỗi khi khoảng không hợp lệ

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
        if (msg.sender != owner) {
            revert NotOwner(msg.sender);
        }
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
        if (students[_mssv].exists) {
            revert StudentAlreadyExists(_mssv);
        }
        
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
        if (!students[_mssv].exists) {
            revert StudentNotFound(_mssv);
        }

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
        if (!students[_mssv].exists) {
            revert StudentNotFound(_mssv);
        }
        if (_diem < 0 || _diem > 10) {
            revert InvalidGrade(_diem);
        }

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
        if (!students[_mssv].exists) {
            revert StudentNotFound(_mssv);
        }

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
        if (start > end) {
            revert InvalidRange(start, end);
        }
        if (end >= studentArray.length) {
            revert InvalidRange(start, end);
        }

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
        if (!students[_mssv].exists) {
            revert StudentNotFound(_mssv);
        }
        return students[_mssv].monHocDaHoanThanh;
    }

    // Lay diem mon hoc da hoan thanh cua sinh vien
    function getGradeForCourse(uint256 _mssv, uint256 _maMonHoc) public view returns (uint256) {
        if (!students[_mssv].exists) {
            revert StudentNotFound(_mssv);
        }
        
        Student storage student = students[_mssv];
        bool courseExists = false;
        
        for (uint256 i = 0; i < student.monHocDaHoanThanh.length; i++) {
            if (student.monHocDaHoanThanh[i] == _maMonHoc) {
                courseExists = true;
                break;
            }
        }
        
        if (!courseExists) {
            revert CourseNotCompleted(_maMonHoc);
        }
        return student.diemMonHocDaHoanThanh[_maMonHoc];
    }
}
