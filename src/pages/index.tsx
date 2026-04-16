import type {ReactNode} from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Resources from '@site/src/components/HomepageResources';
import Heading from '@theme/Heading';
import SearchBar from '@theme/SearchBar';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
      <>
        <header className={clsx('hero hero--primary', styles.heroBanner)}>
          <div className="container">
            <Heading as="h1" className="hero__title">
              <span className={styles.titleWithLogo}>
                <img
                  src="/img/ff!-icon-black.svg"
                  alt="FF!"
                  className={styles.titleLogo}
                />
                docs
              </span>
            </Heading>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <div className={styles.heroSearch}>
              <SearchBar />
            </div>
          </div>
        </header>
        <div className="next-section"></div>
    </>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      description="The official documentation for the Frank!Framework">
      <HomepageHeader />
      <main>
        <Resources />
      </main>
    </Layout>
  );
}
