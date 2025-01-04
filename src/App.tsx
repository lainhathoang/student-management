import React, { useEffect, useState, ChangeEvent } from "react";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { createPublicClient, createWalletClient, custom, getContract, http, WalletClient } from "viem";
import { bscTestnet } from "viem/chains";
import { CONTRACT_ADDRESS } from "./consts";
import { CONTRACT_ABI } from "./types/contract.abi";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

// ABI của smart contract (hạn chế chỉ lấy các phương thức cần thiết)
const contractABI = [
  "function addStudent(uint256 _id, string memory _name, uint256 _birthYear, string memory _managementClass) public",
  "function updateStudentName(uint256 _id, string memory _newName) public",
  "function addCompletedCourse(uint256 _id, uint256 _courseId) public",
  "function updateCourseGrade(uint256 _id, uint256 _courseId, uint256 _grade) public",
  "function getStudentInfo(uint256 _id) public view returns (string memory name, uint256 birthYear, string memory managementClass, uint256[] memory completedCourses)",
];

const contractAddress = "0xYourSmartContractAddress"; // Địa chỉ smart contract của bạn

interface StudentInfo {
  name: string;
  birthYear: number;
  managementClass: string;
  completedCourses: number[];
}

const App = () => {
  // const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState(null);
  const [client, setClient] = useState<WalletClient>();
  const [publicClient, setPublicClient] = useState(null);
  const [signer, setSigner] = useState(null);
  const [user, setUser] = useState<string>("");
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [studentId, setStudentId] = useState<number>(0);
  const [newName, setNewName] = useState<string>("");

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
          chain: bscTestnet,
          transport: custom(window.ethereum)
        })

        const publicClient = createPublicClient({
          chain: bscTestnet,
          transport: http()
        })
        setPublicClient(publicClient as any);

        console.log("client: ", client.account);
        setClient(client as any);

        // try {
        //   // Request account access
        //   await window.ethereum.request({ method: "eth_requestAccounts" });

        //   // Get provider and signer
        // const ethProvider = new ethers.BrowserProvider(window.ethereum);
        // setProvider(walletClient);

        //   const signerInstance = await ethProvider.getSigner();
        //   setSigner(signerInstance);

        //   console.log("MetaMask connected!");
        // } catch (error) {
        //   console.error("User rejected connection:", error);
        // }
      } else {
        console.log("Please install MetaMask!");
      }
    };

    detectProvider();


    const contract =  getContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      client: client as any,
    });
    setContract(contract as any);

    // Listen for account changes
    window.ethereum?.on("accountsChanged", detectProvider);

    return () => {
      window.ethereum?.removeListener("accountsChanged", detectProvider);
    };
  }, []);

  // Hàm gọi thêm sinh viên mới vào contract
  const addStudent = async (): Promise<void> => {
    // if (signer) {
    // const contract = new ethers.Contract(contractAddress, contractABI, signer);
    // try {
    //   const tx = await contract.addStudent(1, "John Doe", 2000, "Management 101");
    //   await tx.wait();
    //   alert("Student Added!");
    // } catch (error) {
    //   console.error("Error adding student:", error);
    // }
    // }
  };

  // Hàm lấy thông tin sinh viên từ contract
  const getStudentInfo = async (): Promise<void> => {
    if (studentId <= 0 || !(typeof studentId === "number") || studentId === 0) {
      alert("Deo hop le");
      return;
    }

    if (contract) {
      console.log("contract: ", contract);

      try {
        const data = await (publicClient as any).readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getStudentInfo',
          args: [studentId]
        })

        setStudentInfo({
          name: data[0],
          birthYear: data[1],
          managementClass: data[2],
          completedCourses: data[3]
        })

        console.log("data: ", data);
      } catch (error) {
        alert("Deo hop le");
      }

    } else {
      console.log("Contract not found!");
    }
  };

  // Hàm cập nhật tên sinh viên
  const updateStudentName = async (): Promise<void> => {};

  const handleStudentIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStudentId(Number(e.target.value));
  };

  const handleNewNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    // setNewName(e.target.value);
  };

  return (
    <div className="App">
      <h1>Student Management</h1>
      <h2>Connected Account: {user}</h2>

      <div>
        <button onClick={addStudent}>Add Student</button>
      </div>

      <div>
        <h2>Get Student Info</h2>
        <input
          type="number"
          placeholder="Enter Student ID"
          onChange={handleStudentIdChange}
        />
        <button onClick={getStudentInfo}>Get Student Info</button>
        {studentInfo && (
          <div>
            <p>Tên: {studentInfo.name}</p>
            <p>Năm sinh: {studentInfo.birthYear.toString()}</p>
            <p>Lớp: {studentInfo.managementClass}</p>
            <p>Khoá học đã hoàn thành: {studentInfo.completedCourses.join(', ')}</p>
          </div>
        )}
      </div>

      <div>
        <h2>Update Student Name</h2>
        <input
          type="number"
          placeholder="Enter Student ID"
          onChange={handleStudentIdChange}
        />
        <input
          type="text"
          placeholder="New Name"
          onChange={handleNewNameChange}
        />
        <button onClick={updateStudentName}>Update Name</button>
      </div>
    </div>
  );
};

export default App;
