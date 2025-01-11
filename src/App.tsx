import React, { useEffect, useState, ChangeEvent } from "react";
import { MetaMaskInpageProvider } from "@metamask/providers";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
  WalletClient,
} from "viem";
import { sepolia } from "viem/chains";
import { CONTRACT_ADDRESS } from "./shared/consts";
import { CONTRACT_ABI } from "./abi/contract.abi";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

interface StudentInfo {
  mssv: number;
  name: string;
  birthYear: number;
  managementClass: string;
}

interface StudentInfoDetails {
  mssv: number;
  name: string;
  birthYear: number;
  managementClass: string;
  completed: string[];
}

const App = () => {
  const [contract, setContract] = useState<any>(null);
  const [client, setClient] = useState<WalletClient>();
  const [publicClient, setPublicClient] = useState<any>(null);
  const [user, setUser] = useState<string>("");
  const [studentInfo, setStudentInfo] = useState<StudentInfoDetails | null>(
    null
  );
  const [studentId, setStudentId] = useState<number>(0);
  const [studentIdDetail, setStudentIdDetail] = useState<number>(0);
  const [studentName, setStudentName] = useState<string>("");
  const [birthYear, setBirthYear] = useState<number>(0);
  const [managementClass, setManagementClass] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [addTransactionStatus, setAddTransactionStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [deleteTransactionStatus, setDeleteTransactionStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState<StudentInfo[]>([]);
  const [studentIds, setStudentIds] = useState<number[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(1);
  const [totalStudent, setTotalStudent] = useState<number>(0);
  const [deleteMssv, setDeleteMssv] = useState<number>(0);

  const handleDeleteMssvChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDeleteMssv(Number(e.target.value));
  };

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const ethereum = window.ethereum;
          const accounts = (await ethereum
            .request({
              method: "eth_requestAccounts",
            })
            .catch((error: any) => {
              if (error.code === -32002) {
                alert(
                  "Please check MetaMask. Connection request already pending."
                );
              }
              throw error;
            })) as string[];

          if (accounts && accounts.length > 0) {
            setUser(accounts[0]);
          }
        } catch (error) {
          console.error("Connection error:", error);
        }
      } else {
        console.log("Please install MetaMask!");
      }
    };

    connectWallet();
  }, []);

  useEffect(() => {
    const detectProvider = async () => {
      if (typeof window.ethereum !== "undefined") {
        const ethereum = window.ethereum;
        console.log("provider: ", window.ethereum.isMetaMask);

        const accounts: any = await ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("accounts: ", accounts);
        setUser(accounts[0].toString());

        const client = createWalletClient({
          account: accounts[0],
          chain: sepolia,
          transport: custom(window.ethereum),
        });

        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http(),
        });
        setPublicClient(publicClient);

        console.log("client: ", client.account);
        setClient(client);

        const contract = getContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          client: client,
        });
        setContract(contract);
      } else {
        console.log("Please install MetaMask!");
      }
    };

    detectProvider();

    window.ethereum?.on("accountsChanged", detectProvider);

    return () => {
      window.ethereum?.removeListener("accountsChanged", detectProvider);
    };
  }, []);

  const validateInputs = () => {
    if (studentId <= 0 || !studentName || birthYear <= 0 || !managementClass) {
      alert("Please fill in all fields correctly");
      return false;
    }
    return true;
  };

  const addStudent = async (): Promise<void> => {
    if (!client || !contract) {
      console.error("Client or contract not initialized");
      return;
    }

    if (!validateInputs()) return;

    setAddTransactionStatus("pending");
    setErrorMessage(null);
    setTransactionHash(null);

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "addStudent",
        args: [studentId, studentName, birthYear, managementClass],
        account: client.account,
      });

      const hash = await client.writeContract(request);
      setTransactionHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        setAddTransactionStatus("success");
        alert("Student Added!");
      } else {
        setAddTransactionStatus("error");
        setErrorMessage("Transaction failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error adding student:", error);
      let detailedErrorMessage = "Thêm student lỗi.";
      if (error?.shortMessage?.includes("ContractFunctionRevertedError")) {
        const errorReason =
          error?.cause?.data?.errorName ||
          error?.cause?.data?.message ||
          error?.shortMessage;
        detailedErrorMessage = `Blockchain error: ${errorReason}`;
      } else if (error?.shortMessage?.includes("StudentAlreadyExists")) {
        detailedErrorMessage = `Sinh viên với MSSV ${studentId} đã tồn tại.`;
      }
      setErrorMessage(detailedErrorMessage);
      setAddTransactionStatus("error");
    }
  };

  const getStudentInfo = async (): Promise<void> => {
    if (
      studentIdDetail <= 0 ||
      !(typeof studentIdDetail === "number") ||
      studentIdDetail === 0
    ) {
      alert("Invalid Student ID");
      return;
    }

    if (contract) {
      console.log("contract: ", contract);

      try {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "getStudentByMSSV",
          args: [studentIdDetail],
        });

        console.log("Data: ", data);

        setStudentInfo({
          mssv: Number(data[0]),
          name: data[1],
          birthYear: Number(data[2]),
          managementClass: data[3],
          completed: [],
        });

        console.log("data: ", data);
      } catch (error) {
        console.error("Error fetching student info:", error);
        alert("Invalid Student ID or contract error");
      }
    } else {
      console.log("Contract not found!");
    }
  };

  const updateStudentName = async (): Promise<void> => {
    if (!client || !contract) {
      console.error("Client or contract not initialized");
      return;
    }

    if (studentId <= 0 || !newName) {
      alert("Please fill in all fields correctly");
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "updateStudentName",
        args: [studentId, newName],
        account: client.account,
      });

      const transactionHash = await client.writeContract(request);
      console.log("Transaction Hash:", transactionHash);
      alert("Student Name Updated!");
    } catch (error) {
      console.error("Error updating student name:", error);
      alert("Failed to update student name");
    }
  };

  const fetchStudents = async () => {
    console.log("start: ", start);
    console.log("end: ", end);

    if (!contract || !publicClient) {
      console.error("Contract or public client not initialized");
      return;
    }

    setLoadingStudents(true);
    setStudentsList([]);

    try {
      const studentIds = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getStudentsInRange",
        args: [start, end],
      });

      setStudentIds(studentIds);

      const students: StudentInfo[] = [];
      for (const studentId of studentIds) {
        const studentData = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "getStudentByMSSV",
          args: [studentId],
        });

        if (studentData && studentData[4]) {
          students.push({
            mssv: Number(studentData[0]),
            name: studentData[1],
            birthYear: Number(studentData[2]),
            managementClass: studentData[3],
          });
        }
      }

      setStudentsList(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Failed to fetch students");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    console.log("studentListLength after update: ", studentsList.length);
  }, [studentsList]);

  const getTotalStudents = async () => {
    setLoadingStudents(true);
    const totalStudent = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getTotalStudents",
    });

    setTotalStudent(Number(totalStudent));
    setLoadingStudents(false);
  };

  const handleStudentIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStudentId(Number(e.target.value));
  };

  const handleStudentIdDetailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStudentIdDetail(Number(e.target.value));
  };

  const handleNewNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const deleteStudent = async (mssv: number): Promise<void> => {
    if (!client || !contract) {
      console.error("Client or contract not initialized");
      return;
    }

    if (mssv <= 0) {
      alert("Invalid Student ID");
      return;
    }

    setDeleteTransactionStatus("pending");
    setErrorMessage(null);
    setTransactionHash(null);

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "deleteStudent",
        args: [mssv],
        account: client.account,
      });

      const hash = await client.writeContract(request);
      setTransactionHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        setDeleteTransactionStatus("success");
        alert("Student Deleted Successfully!");
        fetchStudents();
      } else {
        setDeleteTransactionStatus("error");
        setErrorMessage("Transaction failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error deleting student:", error);
      let detailedErrorMessage = "Xóa sinh viên thất bại.";
      if (error?.shortMessage?.includes("ContractFunctionRevertedError")) {
        const errorReason =
          error?.cause?.data?.errorName ||
          error?.cause?.data?.message ||
          error?.shortMessage;
        detailedErrorMessage = `Blockchain error: ${errorReason}`;
      } else if (error?.shortMessage?.includes("StudentNotFound")) {
        detailedErrorMessage = `Sinh viên với MSSV ${mssv} không tồn tại.`;
      }
      setErrorMessage(detailedErrorMessage);
      setDeleteTransactionStatus("error");
    }
  };

  return (
    <div className="App">
      <h1>Student Management</h1>
      <button
        onClick={async () => {
          if (!user) {
            try {
              const ethereum = window.ethereum;
              if (ethereum) {
                const accounts = (await ethereum
                  .request({
                    method: "eth_requestAccounts",
                  })
                  .catch((error: any) => {
                    if (error.code === -32002) {
                      alert(
                        "Please check MetaMask. Connection request already pending."
                      );
                    }
                    throw error;
                  })) as string[];
                if (accounts && accounts.length > 0) {
                  setUser(accounts[0]);
                }
              }
            } catch (error) {
              console.error("Connection error:", error);
            }
          } else {
            setUser("");
            setClient(undefined);
            setContract(null);
          }
        }}
      >
        {user ? "Disconnect Wallet" : "Connect Wallet"}
      </button>
      <h2>Connected Account: {user}</h2>

      <div>
        <h2>Thêm sinh viên</h2>
        <div>
          <input
            type="number"
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(Number(e.target.value))}
          />
          <input
            type="text"
            placeholder="Student Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Birth Year"
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
          />
          <input
            type="text"
            placeholder="Management Class"
            value={managementClass}
            onChange={(e) => setManagementClass(e.target.value)}
          />
          <button
            onClick={addStudent}
            disabled={addTransactionStatus === "pending"}
          >
            {addTransactionStatus === "pending" ? "Đang thêm" : "Thêm sinh viên"}
          </button>
        </div>

        {addTransactionStatus === "success" && transactionHash && (
          <div style={{ color: "green", marginTop: "10px" }}>
            <p>Thêm sinh viên thành công</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Xem trên Sepolia Etherscan
            </a>
          </div>
        )}

        {addTransactionStatus === "error" && (
          <div style={{ color: "red", marginTop: "10px" }}>
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      <div>
        <h2>Xoá sinh viên</h2>
        <input
          type="number"
          placeholder="Nhập vào mssv"
          value={deleteMssv}
          onChange={handleDeleteMssvChange}
        />
        <button
          onClick={() => deleteStudent(deleteMssv)}
          disabled={deleteTransactionStatus === "pending"}
        >
          {deleteTransactionStatus === "pending" ? "Đang xoá..." : "Xoá student"}
        </button>

        {deleteTransactionStatus === "success" && transactionHash && (
          <div style={{ color: "green", marginTop: "10px" }}>
            <p>Xóa sinh viên thành công</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Xem trên Sepolia Etherscan
            </a>
          </div>
        )}

        {deleteTransactionStatus === "error" && (
          <div style={{ color: "red", marginTop: "10px" }}>
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      <div>
        <h2>Lấy thông tin chi tiết sinh viên</h2>
        <input
          type="number"
          placeholder="Nhập vào mssv"
          onChange={handleStudentIdDetailChange}
        />
        <button onClick={getStudentInfo}>Lấy</button>
        {studentInfo && (
          <div>
            <p>Mssv: {studentInfo.mssv}</p>
            <p>Tên: {studentInfo.name}</p>
            <p>Năm sinh: {studentInfo.birthYear.toString()}</p>
            <p>Lớp: {studentInfo.managementClass}</p>
          </div>
        )}
      </div>

      <div>
        <h2>Tổng số sinh viên</h2>
        <button onClick={getTotalStudents} disabled={loadingStudents}>
          Lấy
        </button>
        {loadingStudents ? (
          "Đang load ..."
        ) : (
          <p>Tổng số sinh viên: {totalStudent}</p>
        )}
      </div>

      <div>
        <h2>Danh sách sinh viên </h2>
        <div>
          <input
            type="number"
            placeholder="Start"
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="End"
            value={end}
            onChange={(e) => setEnd(Number(e.target.value))}
          />
          <button onClick={fetchStudents} disabled={loadingStudents}>
            {loadingStudents ? "Đang load..." : "Lấy sinh viên"}
          </button>
        </div>

        {loadingStudents ? (
          <p>Đang tải danh sách sinh viên...</p>
        ) : (
          <ul>
            {studentsList.map((student, index) => (
              <li key={index}>
                <p>
                  <strong>MSSV:</strong> {Number(student.mssv)} - {student.name}{" "}
                  - {student.birthYear} - {student.managementClass}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;