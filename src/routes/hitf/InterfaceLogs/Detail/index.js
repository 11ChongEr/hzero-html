/*
 * Detail - 接口监控详情
 * @date: 2018/09/17 15:40:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { Header } from 'components/Page';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from '../index.less';

const promptCode = 'hitf.interfaceLogs';
const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hitf.interfaceLogs'] })
@connect(({ loading, interfaceLogs }) => ({
  fetchLogsDetailLoading: loading.effects['interfaceLogs/fetchLogsDetail'],
  interfaceLogs,
  organizationId: getCurrentOrganizationId(),
}))
export default class Detail extends PureComponent {
  componentDidMount() {
    this.getData();
  }

  @Bind()
  getData() {
    const { dispatch, match } = this.props;
    const { interfaceLogId } = match.params;
    dispatch({
      type: 'interfaceLogs/fetchLogsDetail',
      payload: { interfaceLogId },
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      interfaceLogs: { detail },
      fetchLogsDetailLoading,
    } = this.props;
    const basePath = '/hitf/interface-logs';
    const reqBodyParamList = `${detail.interfaceLogDtlList &&
      detail.interfaceLogDtlList.map(item => `${item.reqBodyParam}\n`)}`;
    const interfaceReqBodyParamList = `${detail.interfaceLogDtlList &&
      detail.interfaceLogDtlList.map(item => `${item.interfaceReqBodyParam}\n`)}`;
    const respContentList = `${detail.interfaceLogDtlList &&
      detail.interfaceLogDtlList.map(item => `${item.respContent}\n`)}`;
    const interfaceRespContentList = `${detail.interfaceLogDtlList &&
      detail.interfaceLogDtlList.map(item => `${item.interfaceRespContent}\n`)}`;
    const stacktraceList = `${detail.interfaceLogDtlList &&
      detail.interfaceLogDtlList.map(item => `${item.stacktrace}\n`)}`;
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.interfaceLogsDetail`).d('接口监控详情')}
          backPath={`${basePath}/list`}
        />
        <Spin spinning={fetchLogsDetailLoading}>
          <div className={styles['information-container']}>
            <div className={styles['information-title']}>
              {intl.get(`${promptCode}.view.message.baseMessage`).d('基本信息')}
            </div>
            <Row
              className={styles['information-item']}
              type="flex"
              justify="space-between"
              align="bottom"
            >
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.invokeKey`).d('请求ID')}:
                  </Col>
                  <Col md={18}>{detail.invokeKey}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.applicationCode`).d('应用代码')}:
                  </Col>
                  <Col md={18}>{detail.applicationCode}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.applicationName`).d('应用名称')}:
                  </Col>
                  <Col md={18}>{detail.applicationName}</Col>
                </Row>
              </Col>
            </Row>
            <Row
              className={styles['information-item']}
              type="flex"
              justify="space-between"
              align="bottom"
            >
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.serverCode`).d('服务代码')}:
                  </Col>
                  <Col md={18}>{detail.serverCode}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.serverName`).d('服务名称')}:
                  </Col>
                  <Col md={18}>{detail.serverName}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.clientId`).d('客户端ID')}:
                  </Col>
                  <Col md={18}>{detail.clientId}</Col>
                </Row>
              </Col>
            </Row>
            <Row
              className={styles['information-item']}
              type="flex"
              justify="space-between"
              align="bottom"
            >
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.interfaceRequestTime`).d('请求时间')}:
                  </Col>
                  <Col md={18}>{detail.interfaceRequestTime}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.ip`).d('请求IP')}:
                  </Col>
                  <Col md={18}>{detail.ip}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.requestMethod`).d('请求方式')}:
                  </Col>
                  <Col md={18}>{detail.requestMethod}</Col>
                </Row>
              </Col>
            </Row>
            <Row
              className={styles['information-item']}
              type="flex"
              justify="space-between"
              align="bottom"
            >
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.responseTime`).d('系统响应时间(ms)')}:
                  </Col>
                  <Col md={18}>{detail.responseTime}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl
                      .get(`${promptCode}.view.message.interfaceResponseTime`)
                      .d('接口响应时间(ms)')}
                    :
                  </Col>
                  <Col md={18}>{detail.interfaceResponseTime}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.interfaceType`).d('接口类型')}:
                  </Col>
                  <Col md={18}>{detail.interfaceType}</Col>
                </Row>
              </Col>
            </Row>
            <Row
              className={styles['information-item']}
              type="flex"
              justify="space-between"
              align="bottom"
            >
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.interfaceUrl`).d('接口地址')}:
                  </Col>
                  <Col md={18}>{detail.interfaceUrl}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.responseStatus`).d('请求状态')}:
                  </Col>
                  <Col md={18}>{detail.responseStatus === 'success' ? '成功' : '失败'}</Col>
                </Row>
              </Col>
            </Row>
            <Row
              className={styles['information-item']}
              type="flex"
              justify="space-between"
              align="bottom"
            >
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.userAgent`).d('User-Agent')}:
                  </Col>
                  <Col md={18}>{detail.userAgent}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.referer`).d('Referer')}:
                  </Col>
                  <Col md={18}>{detail.referer}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} className={styles['information-item-label']}>
                    {intl.get(`${promptCode}.view.message.interfaceType`).d('接口类型')}:
                  </Col>
                  <Col md={18}>{detail.interfaceType}</Col>
                </Row>
              </Col>
            </Row>
          </div>
          <div className={styles['information-container']}>
            <div className={styles['information-title']}>
              {intl.get(`${promptCode}.view.message.detailMessage`).d('详情信息')}
            </div>
            <Row gutter={24}>
              <Col span={10}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.interfaceLogs.reqBodyParam`)
                    .d('内部调用参数')}
                >
                  {getFieldDecorator('reqBodyParam', {
                    initialValue: reqBodyParamList,
                  })(<TextArea style={{ height: 150 }} disabled />)}
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.interfaceLogs.interfaceReqBodyParam`)
                    .d('外部调用参数')}
                >
                  {getFieldDecorator('interfaceReqBodyParam', {
                    initialValue: interfaceReqBodyParamList,
                  })(<TextArea style={{ height: 150 }} disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={10}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.interfaceLogs.respContent`)
                    .d('内部响应内容')}
                >
                  {getFieldDecorator('respContent', {
                    initialValue: respContentList,
                  })(<TextArea style={{ height: 150 }} disabled />)}
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.interfaceLogs.interfaceRespContent`)
                    .d('外部响应内容')}
                >
                  {getFieldDecorator('interfaceRespContent', {
                    initialValue: interfaceRespContentList,
                  })(<TextArea style={{ height: 150 }} disabled />)}
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className={styles['information-container']}>
            <div className={styles['information-title']}>
              {intl.get(`${promptCode}.view.message.stacktraceMessage`).d('异常信息')}
            </div>
            <Row gutter={24}>
              <Col span={20}>
                <Form.Item>
                  {getFieldDecorator('stacktrace', {
                    initialValue: stacktraceList,
                  })(<TextArea style={{ height: 150 }} disabled />)}
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Spin>
      </React.Fragment>
    );
  }
}
