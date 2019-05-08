import React from 'react';
import { Card, List, Avatar } from 'hzero-ui';
import moment from 'moment';
import styles from './Activities.less';

const activities = [
  {
    id: 'trend-1',
    updatedAt: '2018-06-29T02:54:51.055Z',
    user: {
      name: '曲丽丽',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    },
    group: { name: '高逼格设计天团', link: 'http://github.com/' },
    project: { name: '六月迭代', link: 'http://github.com/' },
    template: '在 @{group} 新建项目 @{project}',
  },
  {
    id: 'trend-2',
    updatedAt: '2018-06-29T02:54:51.055Z',
    user: {
      name: '付小小',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/cnrhVkzwxjPwAaCfPbdc.png',
    },
    group: { name: '高逼格设计天团', link: 'http://github.com/' },
    project: { name: '六月迭代', link: 'http://github.com/' },
    template: '在 @{group} 新建项目 @{project}',
  },
  {
    id: 'trend-3',
    updatedAt: '2018-06-29T02:54:51.055Z',
    user: {
      name: '林东东',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/gaOngJwsRYRaVAuXXcmB.png',
    },
    group: { name: '中二少女团', link: 'http://github.com/' },
    project: { name: '六月迭代', link: 'http://github.com/' },
    template: '在 @{group} 新建项目 @{project}',
  },
  {
    id: 'trend-4',
    updatedAt: '2018-06-29T02:54:51.055Z',
    user: {
      name: '周星星',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WhxKECPNujWoWEFNdnJE.png',
    },
    project: { name: '5 月日常迭代', link: 'http://github.com/' },
    template: '将 @{project} 更新至已发布状态',
  },
  {
    id: 'trend-5',
    updatedAt: '2018-06-29T02:54:51.055Z',
    user: {
      name: '朱偏右',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ubnKSIfAJTxIgXOKlciN.png',
    },
    project: { name: '工程效能', link: 'http://github.com/' },
    comment: { name: '留言', link: 'http://github.com/' },
    template: '在 @{project} 发布了 @{comment}',
  },
  {
    id: 'trend-6',
    updatedAt: '2018-06-29T02:54:51.055Z',
    user: {
      name: '乐哥',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/jZUIxmJycoymBprLOUbT.png',
    },
    group: { name: '程序员日常', link: 'http://github.com/' },
    project: { name: '品牌迭代', link: 'http://github.com/' },
    template: '在 @{group} 新建项目 @{project}',
  },
];

export default class Activities extends React.Component {
  renderActivities() {
    // const { activities: { list } } = this.props;
    return activities.map(item => {
      const events = item.template.split(/@\{([^{}]*)\}/gi).map(key => {
        if (item[key]) {
          return (
            <a href={item[key].link} key={item[key].name}>
              {item[key].name}
            </a>
          );
        }
        return key;
      });
      return (
        <List.Item key={item.id}>
          <List.Item.Meta
            avatar={<Avatar src={item.user.avatar} />}
            title={
              <span>
                <a className={styles.username}>{item.user.name}</a>
                &nbsp;
                <span className={styles.event}>{events}</span>
              </span>
            }
            description={
              <span className={styles.datetime} title={item.updatedAt}>
                {moment(item.updatedAt).fromNow()}
              </span>
            }
          />
        </List.Item>
      );
    });
  }

  render() {
    return (
      <Card bodyStyle={{ padding: 0 }} bordered={false} title="动态">
        <List size="large">
          <div className={styles.activitiesList}>{this.renderActivities()}</div>
        </List>
      </Card>
    );
  }
}
