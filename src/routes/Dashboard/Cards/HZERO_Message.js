/**
 * Message -系统消息、平台公告
 * @date: 2019-02-19
 * @author YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Col, Tabs, Row, Icon, Timeline } from 'hzero-ui';
import { Link } from 'dva/router';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './Cards.less';
import temporarily from '../../../assets/dashboard/temporarily-no-data.svg';
import winningImg from '../../../assets/dashboard/winning-notice.svg';
import businessImg from '../../../assets/dashboard/business-friend.svg';
import industryImg from '../../../assets/dashboard/industry-news.svg';
import companyImg from '../../../assets/dashboard/company-notice.svg';
import otherImg from '../../../assets/dashboard/other.svg';
import newsImg from '../../../assets/dashboard/news.svg';
import platformImg from '../../../assets/dashboard/platform-bulletin.svg';

@connect(({ cards, loading }) => ({
  cards,
  loading: loading.effects['cards/querySystemMessage'],
}))
@formatterCollections({ code: 'dashboard.cards' })
export default class Message extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabBar: 'message',
    };
  }

  componentDidMount() {
    this.handleSystemMessage();
    this.handleAnnouncementList();
  }

  /**
   * 查询系统消息
   */
  @Bind()
  handleSystemMessage() {
    const { dispatch } = this.props;
    dispatch({
      type: 'cards/querySystemMessage',
      payload: {
        previewMessageCount: 999999,
        withContent: true,
      },
    });
  }

  /**
   * 查询平台公告
   */
  @Bind()
  handleAnnouncementList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'cards/queryAnnouncement',
      payload: {
        size: 999999,
        page: 0,
        statusCode: 'PUBLISHED',
      },
    });
  }

  /**
   * 标记已读
   * @param {*} number
   */
  @Bind()
  handleRead(number) {
    const { dispatch } = this.props;
    dispatch({
      type: 'cards/changeRead',
      payload: {
        messageIdList: number,
      },
    }).then(res => {
      if (res) {
        this.handleSystemMessage();
      }
    });
  }

  /**
   * 系统消息刷新
   */
  @Bind()
  handleMessageSearch() {
    this.handleSystemMessage();
  }

  /**
   * 公告刷新
   */
  @Bind()
  handleAnnouncementSearch() {
    this.handleAnnouncementList();
  }

  /**
   * 标签栏附加内容的显示
   */
  @Bind()
  handleCallback(key) {
    this.setState({
      tabBar: key,
    });
  }

  /**
   * 系统消息数据展示
   */
  @Bind()
  handleColor(item, key) {
    if (key % 4 === 0) {
      return (
        <Timeline.Item key={`system-item-${item.messageId}`} color="#0687ff">
          <Row className={styles['message-row']}>
            <Col span={16} className={styles['message-title']}>
              {item.subject}
            </Col>
            <Col span={7} className={styles['message-time']}>
              {item.creationDate}
            </Col>
            <Col span={1}>
              <a
                onClick={() => this.handleRead(item.messageId)}
                style={{ float: 'right' }}
                className={styles['message-close']}
              >
                <Icon type="close" />
              </a>
            </Col>
            <Col
              span={23}
              className={styles['message-list']}
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </Row>
        </Timeline.Item>
      );
    } else if (key % 4 === 1) {
      return (
        <Timeline.Item key={`system-item-${item.messageId}`} color="#cb38ad">
          <Row className={styles['message-row']}>
            <Col span={16} className={styles['message-title']}>
              {item.subject}
            </Col>
            <Col span={7} className={styles['message-time']}>
              {item.creationDate}
            </Col>
            <Col span={1}>
              <a
                onClick={() => this.handleRead(item.messageId)}
                style={{ float: 'right' }}
                className={styles['message-close']}
              >
                <Icon type="close" />
              </a>
            </Col>
            <Col
              span={23}
              className={styles['message-list']}
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </Row>
        </Timeline.Item>
      );
    } else if (key % 4 === 2) {
      return (
        <Timeline.Item key={`system-item-${item.messageId}`} color="#ffbc00">
          <Row className={styles['message-row']}>
            <Col span={16} className={styles['message-title']}>
              {item.subject}
            </Col>
            <Col span={7} className={styles['message-time']}>
              {item.creationDate}
            </Col>
            <Col span={1}>
              <a
                onClick={() => this.handleRead(item.messageId)}
                style={{ float: 'right' }}
                className={styles['message-close']}
              >
                <Icon type="close" />
              </a>
            </Col>
            <Col
              span={23}
              className={styles['message-list']}
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </Row>
        </Timeline.Item>
      );
    } else if (key % 4 === 3) {
      return (
        <Timeline.Item key={`system-item-${item.messageId}`} color="#f02b2b">
          <Row className={styles['message-row']}>
            <Col span={16} className={styles['message-title']}>
              {item.subject}
            </Col>
            <Col span={7} className={styles['message-time']}>
              {item.creationDate}
            </Col>
            <Col span={1}>
              <a
                onClick={() => this.handleRead(item.messageId)}
                style={{ float: 'right' }}
                className={styles['message-close']}
              >
                <Icon type="close" />
              </a>
            </Col>
            <Col
              span={23}
              className={styles['message-list']}
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </Row>
        </Timeline.Item>
      );
    }
  }

  render() {
    const { cards: { systemMessageList = [], announcementList = [] } = {} } = this.props;
    const { tabBar } = this.state;
    const operations = (
      <div style={{ paddingTop: '13px', paddingRight: '24px' }}>
        {tabBar === 'message' && (
          <div style={{ fontSize: '14px', lineHeight: '22px' }}>
            <Link to="/hmsg/user-message/list">
              消息中心{'   '}
              <Icon type="double-right" />
            </Link>
            <a onClick={() => this.handleMessageSearch()} style={{ marginLeft: '16px' }}>
              刷新{'   '}
              <Icon type="reload" />
            </a>
          </div>
        )}
        {tabBar === 'announcement' && (
          <div style={{ fontSize: '14px', lineHeight: '22px' }}>
            <a onClick={() => this.handleAnnouncementSearch()}>
              刷新{'   '}
              <Icon type="reload" />
            </a>
          </div>
        )}
      </div>
    );
    return (
      <Tabs
        tabBarExtraContent={operations}
        size="large"
        tabBarGutter={0}
        onChange={this.handleCallback}
        className={styles.height}
        defaultActiveKey="message"
      >
        <Tabs.TabPane tab="系统消息" key="message" className={styles.message}>
          {!isEmpty(systemMessageList) && (
            <Timeline
              className={styles['message-overflow']}
              style={{ padding: '10px 16px 10px 16px' }}
            >
              {systemMessageList.map((item, index) => {
                return this.handleColor(item, index);
              })}
            </Timeline>
          )}
          {isEmpty(systemMessageList) && (
            <div style={{ textAlign: 'center' }}>
              <img src={temporarily} alt="" style={{ marginTop: '35px' }} />
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="平台公告" key="announcement" className={styles.notice}>
          {!isEmpty(announcementList) && (
            <div className={styles['notice-overflow']}>
              {announcementList.map(item => {
                const platform = ['PTGG'].indexOf(item.noticeTypeCode);
                const news = ['GSXW'].indexOf(item.noticeTypeCode);
                const tender = ['ZBYG', 'ZBGG', 'ZBCQ', 'XJTZ', 'BJTZ'].indexOf(
                  item.noticeTypeCode
                );
                const circle = ['XPZJ', 'SYQ'].indexOf(item.noticeTypeCode);
                const industry = ['HYZX'].indexOf(item.noticeTypeCode);
                const other = ['QTGG'].indexOf(item.noticeTypeCode);
                const notices = ['GSWD', 'GSTZ', 'GSZD'].indexOf(item.noticeTypeCode);
                return (
                  <Row
                    key={`system-item-${item.noticeId}`}
                    type="flex"
                    justify="space-around"
                    align="middle"
                    className={styles['notice-row']}
                  >
                    <Col span={3} className={styles['notice-type']}>
                      {platform !== -1 && (
                        <img alt="" src={platformImg} className={styles['notice-img']} />
                      )}
                      {news !== -1 && <img alt="" src={newsImg} className={styles['notice-img']} />}
                      {tender !== -1 && (
                        <img alt="" src={winningImg} className={styles['notice-img']} />
                      )}
                      {circle !== -1 && (
                        <img alt="" src={businessImg} className={styles['notice-img']} />
                      )}
                      {industry !== -1 && (
                        <img alt="" src={industryImg} className={styles['notice-img']} />
                      )}
                      {other !== -1 && (
                        <img alt="" src={otherImg} className={styles['notice-img']} />
                      )}
                      {notices !== -1 && (
                        <img alt="" src={companyImg} className={styles['notice-img']} />
                      )}
                      {item.noticeTypeMeaning.length === 3 && (
                        <div className={styles['notice-typeNameThree']}>
                          {item.noticeTypeMeaning}
                        </div>
                      )}
                      {item.noticeTypeMeaning.length !== 3 && (
                        <div className={styles['notice-typeName']}>{item.noticeTypeMeaning}</div>
                      )}
                    </Col>
                    <Col span={21} className={styles['notice-content']}>
                      <Row style={{ marginBottom: '4px' }}>
                        <Col span={16} className={styles['notice-title']}>
                          {item.title}
                        </Col>
                        <Col span={8} className={styles['notice-time']}>
                          {item.publishedDateTimeStr}
                        </Col>
                      </Row>
                      {item.noticeContent && item.noticeContent.noticeBody && (
                        <Col
                          className={styles['notice-list']}
                          dangerouslySetInnerHTML={{ __html: item.noticeContent.noticeBody }}
                        />
                      )}
                    </Col>
                  </Row>
                );
              })}
            </div>
          )}
          {isEmpty(announcementList) && (
            <div style={{ textAlign: 'center' }}>
              <img src={temporarily} alt="" style={{ marginTop: '35px' }} />
            </div>
          )}
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
