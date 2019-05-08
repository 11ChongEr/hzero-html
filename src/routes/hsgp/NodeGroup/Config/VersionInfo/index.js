/**
 * 节点组维护 - 新建节点组 - 选择版本及应用步骤
 * @date: 2018-9-10
 * @author: 王家程 <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Input, Icon, Button, Select, Row, Col, Cascader } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import styles from '../index.less';

const FormItem = Form.Item;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@connect(({ loading, nodeGroup }) => ({
  loading,
  nodeGroup,
}))
@formatterCollections({ code: 'hsgp.nodeGroup' })
export default class VersionInfo extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const {
      dispatch,
      match: {
        params: { productId },
      },
      nodeGroup: {
        versionData: { productVersionId },
      },
    } = this.props;
    // 查询产品版本
    dispatch({
      type: 'nodeGroup/queryProductWithVersion',
      payload: { productId },
    });
    // 编辑时，查询服务/版本
    if (productVersionId) {
      this.handleVersionChange(productVersionId);
    }
  }

  /**
   * @function handleNextStep - 完成应用和版本配置，进行下一步：编辑配置
   */
  @Bind()
  handleNextStep() {
    const {
      dispatch,
      history,
      form,
      match: {
        params: { nodeGroupId, productId, productEnvId },
      },
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'nodeGroup/updateState',
          payload: {
            versionData: fieldsValue,
          },
        });
        history.push(`/hsgp/node-group/${productId}/${productEnvId}/${nodeGroupId}/config`);
      }
    });
  }

  /**
   * @function handlePreStep - 前往上一步，应用信息
   */
  @Bind()
  handlePreStep() {
    const {
      history,
      match: {
        params: { nodeGroupId, productId, productEnvId },
      },
    } = this.props;
    history.push(`/hsgp/node-group/${productId}/${productEnvId}/${nodeGroupId}/app`);
  }

  /**
   * 根据产品查询服务及其版本
   * @param {string} value - 产品版本
   */
  @Bind()
  handleVersionChange(value) {
    const {
      dispatch,
      match: {
        params: { productId },
      },
    } = this.props;
    dispatch({
      type: 'nodeGroup/queryServiceAndVersion',
      payload: {
        productId,
        productVersionId: value,
      },
    });
  }

  render() {
    const {
      form,
      getCurrentStep,
      match: {
        params: { productId },
      },
      nodeGroup: {
        productWithVersionList = [],
        versionData = {},
        serviceWithVersionList = [],
        productWithEnvList = [],
      },
    } = this.props;
    const { productVersionId = '', serviceId, productServiceId = [] } = versionData;
    const { getFieldDecorator } = form;
    const [product = {}] = productWithEnvList.filter(item => item.value === productId);
    const { meaning: productName = '' } = product;
    return (
      <Content>
        <Form>
          <Row type="flex" justify="center">
            <Col span={16}>
              <FormItem
                label={
                  <span>
                    <Icon type="appstore-o" className={styles['node-group-icon']} />
                    产品
                  </span>
                }
                {...formLayout}
              >
                {getFieldDecorator('productName', {
                  initialValue: productName,
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <Col span={16}>
              <FormItem
                label={
                  <span>
                    <Icon type="appstore-o" className={styles['node-group-icon']} />
                    产品版本
                  </span>
                }
                {...formLayout}
              >
                {getFieldDecorator('productVersionId', {
                  initialValue: `${productVersionId}`,
                  rules: [
                    {
                      required: true,
                      message: '请选择产品版本',
                    },
                  ],
                })(
                  <Select
                    disabled={!!productVersionId}
                    placeholder=""
                    onChange={this.handleVersionChange}
                  >
                    {productWithVersionList.map(item => {
                      return (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <Col span={16}>
              <FormItem
                label={
                  <span>
                    <Icon type="unlock" className={styles['node-group-icon']} />
                    服务/版本
                  </span>
                }
                {...formLayout}
              >
                {getFieldDecorator('productServiceId', {
                  initialValue: serviceId ? [`${serviceId}`, `${productServiceId}`] : [],
                  rules: [
                    {
                      type: 'array',
                      required: true,
                      message: '请选择服务/版本',
                    },
                  ],
                })(
                  <Cascader
                    placeholder=""
                    disabled={!!serviceId}
                    expandTrigger="hover"
                    allowClear={false}
                    options={serviceWithVersionList}
                    fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <Col>
              <Button type="primary" style={{ marginRight: '8px' }} onClick={this.handleNextStep}>
                {intl.get('hzero.common.button.next').d('下一步')}
              </Button>
              {getCurrentStep() !== 0 && (
                <Button onClick={this.handlePreStep}>
                  {intl.get('hzero.common.button.previous').d('上一步')}
                </Button>
              )}
            </Col>
          </Row>
        </Form>
      </Content>
    );
  }
}
