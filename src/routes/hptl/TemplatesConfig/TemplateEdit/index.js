import React from 'react';
import { connect } from 'dva';
import { Button, Form, Row, Col } from 'hzero-ui';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_PTL } from 'utils/config';

import TemplateForm from './TemplateForm';

@Form.create({ fieldNameProp: null })
@connect(({ templatesConfig }) => ({
  templatesConfig,
}))
export default class Template extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    const {
      dispatch,
      match: {
        params: { configId },
      },
    } = this.props;
    const { organizationId } = this.state;
    dispatch({
      type: 'templatesConfig/fetchTemplateDetail',
      payload: { configId, organizationId },
    });
  }

  @Bind()
  createCarousel() {
    const {
      dispatch,
      templatesConfig: { templateDetail },
      match: {
        params: { configId },
      },
    } = this.props;
    const { CAROUSEL = [] } = templateDetail;
    dispatch({
      type: 'templatesConfig/updateState',
      payload: {
        templateDetail: {
          ...templateDetail,
          CAROUSEL: [
            ...CAROUSEL,
            {
              configId,
              configItemId: uuid(),
              configCode: 'CAROUSEL',
              imageUrl: '',
              description: '',
              content: '',
              orderSeq: 0,
              isCreate: true,
            },
          ],
        },
      },
    });
  }

  render() {
    const {
      match: {
        params: { templateName, configId },
      },
      templatesConfig: { templateDetail = {} },
    } = this.props;
    const {
      LOGO = [
        {
          configItemId: uuid(),
          configCode: 'LOGO',
          description: '',
          imageUrl: '',
          orderSeq: 0,
          isCreate: true,
        },
      ],
      CAROUSEL = [],
    } = templateDetail;
    if (LOGO.length === 1) {
      LOGO.push({
        configItemId: uuid(),
        configCode: 'LOGO',
        description: '',
        imageUrl: '',
        orderSeq: 0,
        isCreate: true,
      });
    }
    const logoDesc = {
      0: intl.get('hptl.common.view.message.logo.dark').d('1. 深色Logo图片'),
      1: intl.get('hptl.common.view.message.logo.light').d('2. 浅色Logo图片'),
    };
    return (
      <React.Fragment>
        <Header
          title={`${templateName}${intl.get('hzero.common.button.edit').d('编辑')}`}
          backPath={`${HZERO_PTL}/templates-config`}
        />
        <Content>
          <div>
            <p style={{ fontSize: '16px' }}>
              {intl
                .get('hptl.common.view.message.title.logo')
                .d('Logo：配置模板Logo，请设置深色和浅色两张Logo图片，图片格式为jpeg/png。')}
            </p>
            <Row>
              {LOGO.map((item, index) => {
                return (
                  <Col key={item.configItemId}>
                    <TemplateForm
                      initData={item}
                      desc={logoDesc[index]}
                      type="LOGO"
                      configId={configId}
                      key={item.configItemId}
                    />
                  </Col>
                );
              })}
            </Row>
          </div>
          <div style={{ margin: '24px auto' }}>
            <React.Fragment>
              <p style={{ fontSize: '16px' }}>
                {intl
                  .get('hptl.common.view.message.title.banner')
                  .d('首页轮播图：配置模板首页轮播图，图片格式为jpeg/png')}
              </p>
              <Button onClick={this.createCarousel} disabled={CAROUSEL.length >= 4}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
            </React.Fragment>
            {CAROUSEL.map(item => {
              return (
                <TemplateForm
                  initData={item}
                  type="CAROUSEL"
                  configId={configId}
                  key={item.configItemId}
                />
              );
            })}
          </div>
        </Content>
      </React.Fragment>
    );
  }
}
