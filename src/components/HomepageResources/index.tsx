import type {ReactNode} from 'react';
import styles from './styles.module.css';
import DocCard from "@site/src/components/DocCard";

export default function Resources(): ReactNode {
  return (
    <section className={styles.resources}>
      <div className="container">
        <div className="row">
          <DocCard href='/docs/get-started' title='Get Started' description='Get up and running with Frank!Framework in minutes.' />
          <DocCard href='https://frank-manual.readthedocs.io/' title='Manual' description='Documentation about configuration, deployment, testing and operation.' />
          <DocCard href='https://reference.frankframework.org/' title='Reference' description='Technical documentation of FF! components.' />
          <DocCard href='https://frankacademy.nl/' title='Frank!Academy' description='Free training and certification by WeAreFrank!.' />
        </div>
      </div>
    </section>
  );
}
