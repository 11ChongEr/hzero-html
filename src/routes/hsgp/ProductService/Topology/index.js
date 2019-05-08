import React from 'react';
import { connect } from 'dva';
import { Spin, Tooltip } from 'hzero-ui';
import jsplumb from 'jsplumb';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import NodeDetail from './nodeDetail';
import styles from './index.less';

const { jsPlumb } = jsplumb;

@connect(({ loading, productService }) => ({
  fetchTopologyLoading: loading.effects['productService/fetchTopologyList'],
  productService,
}))
export default class Topology extends React.Component {
  constructor(props) {
    super(props);
    this.toolkit = jsPlumb.getInstance({ Container: 'diagramContainer' });
    this.state = {
      // 节点公共属性
      commonConnect: {
        endpoint: 'Blank',
        connector: 'Straight',
        anchor: 'AutoDefault',
        overlays: [['PlainArrow', { width: 12, length: 12, location: 1, paintStyle: '#3c3c5c' }]],
        options: {
          speed: 250,
        },
      },
      modalVisible: false,
      nodeDetailData: {},
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { productId, productVersionId },
      },
      dispatch,
    } = this.props;
    dispatch({
      type: 'productService/fetchTopologyList',
      payload: { productId, productVersionId },
    });
  }

  // eslint-disable-next-line
  UNSAFE_componentWillUpdate() {
    const {
      productService: { topologyData = {} },
    } = this.props;
    const { edges = [] } = topologyData;
    this.toolkit.ready(() => {
      // 设置连线不可拖动
      this.toolkit.importDefaults({ ConnectionsDetachable: false });
      // 连线
      edges.forEach(item => {
        if (item.source && item.target) {
          this.connectPoint(`${item.source}`, `${item.target}`);
          // 设置节点可拖拽
          this.toolkit.draggable(`${item.source}`, { containment: 'diagramContainer' });
          this.toolkit.draggable(`${item.target}`, { containment: 'diagramContainer' });
        }
      });
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'productService/updateState',
      payload: { topologyData: {} },
    });
    // this.toolkit.deleteEveryEndpoint();
    // this.toolkit.deleteEveryConnection();
  }

  render() {
    const {
      fetchTopologyLoading = false,
      match: {
        params: { productName, versionName },
      },
      productService: { topologyData = {} },
    } = this.props;
    const { modalVisible, nodeDetailData } = this.state;
    const { node = [] } = topologyData;

    const detailProps = {
      title: `${nodeDetailData.name}-服务详情`,
      modalVisible,
      nodeDetailData,
      onCancel: this.hideDetailModal,
    };

    return (
      <React.Fragment>
        <Header
          title={`${productName}/${versionName}-拓扑图`}
          backPath="/hsgp/product-service/list"
        />
        <Content style={{ height: '100%' }}>
          <Spin spinning={fetchTopologyLoading} wrapperClassName={styles['topology-spin']}>
            <div id="diagramContainer" className={styles.diagramContainer}>
              {node.length > 0 ? (
                node.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      id={item.id}
                      style={{
                        left: `${index * 100 + 100}px`,
                        top: `${((index * index) % 2) * 100 + 50}px`,
                      }}
                      className={styles.item}
                      onDoubleClick={() => this.handleOpenDetail(item)}
                    >
                      <Tooltip title="双击查看详情">
                        <div className={styles['item-content']}>{item.name}</div>
                      </Tooltip>
                    </div>
                  );
                })
              ) : (
                <div>暂无相关数据</div>
              )}
            </div>
          </Spin>
          <NodeDetail {...detailProps} />
        </Content>
      </React.Fragment>
    );
  }

  @Bind()
  connectPoint(source, target) {
    const { commonConnect } = this.state;
    this.toolkit.connect({ source, target }, commonConnect);
  }

  @Bind()
  handleOpenDetail(data = {}) {
    this.setState({ modalVisible: true, nodeDetailData: data });
  }

  @Bind()
  hideDetailModal() {
    this.setState({ modalVisible: false });
  }
}
