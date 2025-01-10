import React, { useEffect, useState, ChangeEvent } from "react";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { createPublicClient, createWalletClient, custom, getContract, http, WalletClient } from "viem";
import { sepolia } from "viem/chains";
import { CONTRACT_ADDRESS } from "./shared/consts";
import { CONTRACT_ABI } from "./abi/contract.abi";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

interface StudentInfo {
  name: string;
  birthYear: number;
  managementClass: string;
  completedCourses: number[];
}

const App = () => {
  const [contract, setContract] = useState<any>(null);
  const [client, setClient] = useState<WalletClient>();
  const [publicClient, setPublicClient] = useState<any>(null);
  const [user, setUser] = useState<string>("");
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [studentId, setStudentId] = useState<number>(0);
  const [studentName, setStudentName] = useState<string>("");
  const [birthYear, setBirthYear] = useState<number>(0);
  const [managementClass, setManagementClass] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const ethereum = window.ethereum;
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          }).catch((error: any) => {
            if (error.code === -32002) {
              alert('Please check MetaMask. Connection request already pending.');
            }
            throw error;
          }) as string[];

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

    // Listen for account changes
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
  
    setTransactionStatus("pending");
    setErrorMessage(null);
    setTransactionHash(null);
  
    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'addStudent',
        args: [studentId, studentName, birthYear, managementClass],
        account: client.account,
      });
  
      const hash = await client.writeContract(request);
      setTransactionHash(hash);
  
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
      if (receipt.status === "success") {
        setTransactionStatus("success");
        alert("Student Added!");
      } else {
        setTransactionStatus("error");
        setErrorMessage("Transaction failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error adding student:", error);
  
      // Log detailed error in the console
      console.log("Detailed error from blockchain:", error);
  
      // Extract detailed error message from the blockchain
      let detailedErrorMessage = "Thêm student lỗi."; // Updated error message
  
      if (error?.shortMessage?.includes("ContractFunctionRevertedError")) {
        // Try to extract the error reason from the error object
        const errorReason = error?.cause?.data?.errorName || error?.cause?.data?.message || error?.shortMessage;
        detailedErrorMessage = `Blockchain error: ${errorReason}`;
      } else if (error?.shortMessage?.includes("StudentAlreadyExists")) {
        detailedErrorMessage = `Sinh viên với MSSV ${studentId} đã tồn tại.`;
      }
  
      setErrorMessage(detailedErrorMessage);
      setTransactionStatus("error");
    }
  };
  const getStudentInfo = async (): Promise<void> => {
    if (studentId <= 0 || !(typeof studentId === "number") || studentId === 0) {
      alert("Invalid Student ID");
      return;
    }

    if (contract) {
      console.log("contract: ", contract);

      try {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getStudentByMSSV',
          args: [studentId],
        });

        setStudentInfo({
          name: data[1],
          birthYear: Number(data[2]),
          managementClass: data[3],
          completedCourses: [], // You need to fetch completed courses separately if needed
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
        functionName: 'updateStudentName',
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

  const handleStudentIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStudentId(Number(e.target.value));
  };

  const handleNewNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  return (
    <div className="App">
      <h1>Student Management</h1>
      <button onClick={async () => {
        if (!user) {
          try {
            const ethereum = window.ethereum;
            if (ethereum) {
              const accounts = await ethereum.request({
                method: "eth_requestAccounts",
              }).catch((error: any) => {
                if (error.code === -32002) {
                  alert('Please check MetaMask. Connection request already pending.');
                }
                throw error;
              }) as string[];
              if (accounts && accounts.length > 0) {
                setUser(accounts[0]);
              }
            }
          } catch (error) {
            console.error('Connection error:', error);
          }
        } else {
          setUser("");
          setClient(undefined);
          setContract(null);
        }
      }}>
        {user ? "Disconnect Wallet" : "Connect Wallet"}
      </button>
      <h2>Connected Account: {user}</h2>

      <div>
        <h2>Add student</h2>
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
          <button onClick={addStudent} disabled={transactionStatus === "pending"}>
            {transactionStatus === "pending" ? "Adding..." : "Add Student"}
          </button>
        </div>

        {transactionStatus === "success" && transactionHash && (
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

        {transactionStatus === "error" && (
          <div style={{ color: "red", marginTop: "10px" }}>
            <p>{errorMessage}</p>
          </div>
        )}
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