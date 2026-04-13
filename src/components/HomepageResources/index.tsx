import type {ReactNode} from 'react';
import styles from './styles.module.css';
import DocCard from "@site/src/components/DocCard";

export default function Resources(): ReactNode {
  return (
    <section className={styles.resources}>
      <div className="container">
        <div className="row">
          <DocCard href='/docs/category/get-started' title='Get Started' description='Learn Frank!Framework basics.' />
          <DocCard href='https://frank-manual.readthedocs.io/' title='Manual' description='Indepth manual and tutorials.' />
          <DocCard href='https://frankdoc.frankframework.org/' title='Referance' description='Technical documentation of our FF! Components.' />
          <DocCard href='https://frankacademy.nl/' title='Frank!Academy' description='Free training and certification provided by WeAreFrank!.' />
        </div>
      </div>
    </section>
  );
}
