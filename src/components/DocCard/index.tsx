import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type DocCardProps = {
  href: string;
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
  colClassName?: string;
};

export default function DocCard({
  href,
  title,
  description,
  icon = '📄️',
  className,
  colClassName = 'col col--6',
}: DocCardProps): ReactNode {
  return (
    <article className={clsx(styles.docCardListItem, colClassName, className)}>
      <Link className={clsx('card padding--lg theme-doc-card-container', styles.cardContainer)} to={href}>
        <Heading as="h2" className={clsx('theme-doc-card-heading', styles.cardTitle)} title={title}>
          <span className={clsx('theme-doc-card-icon', styles.cardTitleIcon)}>{icon}</span>
          <span className={clsx('text--truncate theme-doc-card-title', styles.cardTitleText)}>{title}</span>
        </Heading>
        <p className={clsx('text--truncate theme-doc-card-description', styles.cardDescription)} title={description}>
          {description}
        </p>
      </Link>
    </article>
  );
}

