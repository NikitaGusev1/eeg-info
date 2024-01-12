import { useCallback, useContext, useEffect, useState } from "react";
import { baseUrl, decodeEdf, getInputFileBuffer } from "../../utils";
import { ChartContext } from "../../contexts/ChartContext";
import { SelectSignalsModal } from "../modals/SelectSignalsModal";
import { Chart } from "../Chart/Chart";
import { LoginModal } from "../modals/LoginModal";
import styled from "styled-components";
import { UserContext } from "../../contexts/UserContext";
import api from "../../api/api";
import { Button } from "@mui/material";
import Dashboard from "../Dashboard/Dashboard";
import { AssignFileModal } from "../modals/AssignFileModal";
import { AddUserModal } from "../modals/AddUserModal";
import ShareIcon from "@mui/icons-material/Share";
import { ShareModal } from "../modals/ShareModal";

export const HomeScreen = () => {
  const {
    selectorOpen,
    setSelectorOpen,
    selectedSignals,
    setSelectedSignals,
    setEdf,
    edf,
  } = useContext(ChartContext);
  const {
    firstName,
    lastName,
    isLoggedIn,
    setFirstName,
    setLastName,
    setEmail,
    setIsLoggedIn,
    setIsAdmin,
    isAdmin,
  } = useContext(UserContext);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // getPhysicalSignalConcatRecords(index, recordStart, howMany)
  // console.log(edf?.getPhysicalSignalConcatRecords(0, 0, 50));
  const isChartReady = edf && !selectorOpen && selectedSignals.length !== 0;

  const tryFetchingUserData = async () => {
    if (!!localStorage.getItem("token")) {
      const response = await api.get(`${baseUrl}/user`);
      if (response.status === 200) {
        setIsLoggedIn(true);

        const userData = response.data;
        setEmail(userData.email);
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setIsAdmin(userData.isAdmin);
      }
    }
  };

  useEffect(() => {
    tryFetchingUserData();
  }, [tryFetchingUserData]);

  const handleChangeFile = useCallback(
    async (event: any) => {
      if (!event.target.files[0]) {
        return;
      }

      const file = event.target.files[0];

      const buffer = await getInputFileBuffer(file);
      const decodedEdf = decodeEdf(buffer);
      setEdf(decodedEdf);

      event.target.value = null;
    },
    [setEdf]
  );

  const handleOpenSelector = useCallback(
    (event: any) => {
      handleChangeFile(event);
      setSelectedSignals([]);
      setSelectorOpen(true);
    },
    [setSelectorOpen, handleChangeFile, setSelectedSignals]
  );

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
  };

  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
  };

  return (
    <div className="App" style={{ padding: 16 }}>
      {!isLoggedIn ? (
        <LoginModal />
      ) : (
        <>
          <TopRightContainer>
            <UserName>{`Logged in as ${firstName} ${lastName}`}</UserName>
            {isAdmin && (
              <Dashboard
                setIsAssignModalOpen={setIsAssignModalOpen}
                setIsAddUserModalOpen={setIsAddUserModalOpen}
              />
            )}
            <Button onClick={handleLogout} variant="outlined">
              Logout
            </Button>
          </TopRightContainer>
          {/* <form>
            <input type="file" onChange={handleOpenSelector} accept=".edf" />
          </form> */}
          <Button variant="contained" component="label">
            Choose File
            <input
              type="file"
              onChange={handleOpenSelector}
              hidden
              accept=".edf"
            />
          </Button>
          <button
            style={{ marginTop: 16, border: "none", background: "none" }}
            onClick={() => setIsShareModalOpen(true)}
          >
            <ShareIcon />
          </button>
          <SelectSignalsModal edf={edf} />
          <AssignFileModal
            open={isAssignModalOpen}
            handleCloseAssignModal={handleCloseAssignModal}
          />
          <AddUserModal
            open={isAddUserModalOpen}
            handleCloseAddUserModal={handleCloseAddUserModal}
          />
          <ShareModal
            open={isShareModalOpen}
            handleCloseShareModal={handleCloseShareModal}
          />
          {isChartReady && <Chart edf={edf} />}
        </>
      )}
    </div>
  );
};

const UserName = styled.p`
  margin-right: 16px;
`;

const TopRightContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  padding: 16px;
`;
