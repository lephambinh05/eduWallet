import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background: linear-gradient(
    135deg,
    #0c0c0c 0%,
    #1a1a2e 25%,
    #16213e 50%,
    #0f3460 75%,
    #533483 100%
  );
  position: relative;
  overflow-x: hidden;
`;

const MainContent = styled(motion.main).attrs((props) => ({
  "data-sidebar-open": props.$sidebarOpen,
}))`
  flex: 1;
  margin-left: ${(props) => (props.$sidebarOpen ? "280px" : "0")};
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
`;

const ContentWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;

  @media (max-width: 1920px) {
    max-width: 1400px;
  }

  @media (max-width: 1440px) {
    max-width: 1200px;
  }

  @media (max-width: 1200px) {
    max-width: 960px;
  }
`;

const PageContent = styled(motion.div)`
  flex: 1;
  padding: 2rem;
  width: 100%;

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const Layout = ({ children }) => {
  // Bắt đầu với sidebar đóng (ẩn hoàn toàn)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <LayoutContainer>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <MainContent
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        $sidebarOpen={sidebarOpen}
      >
        <ContentWrapper>
          <PageContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {children}
          </PageContent>
          <Footer />
        </ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
