import React from 'react';
import { connect } from 'dva';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Card, Button, Icon } from 'hzero-ui';
import { cloneDeep } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import styles from './index.less';
import CardsSetting from './CardsSetting';

const ReactGridLayout = WidthProvider(RGL);

// 将一样的不会变化的样式 抽取出来 放在最外面

const pageContentStyle = { backgroundColor: '#F6F9FD', padding: '0 6px 0 6px' };
const layoutContainerStyle = { position: 'relative' };

const buttonStyle = { float: 'right', marginRight: '12px' };

const setLayoutButtonStyle = { border: 'none', float: 'right', marginRight: '12px' };

@connect(({ workplace, loading }) => ({
  workplace,
  loadAssignableCardsLoading: loading.effects['workplace/fetchCards'],
}))
@formatterCollections({ code: ['hpfm.workplace'] })
export default class Workplace extends React.Component {
  static defaultProps = {
    className: styles.gridLayoutContainer,
    cols: 20,
    rowHeight: 28,
  };

  originLayout = null;

  // 存储进入设计状态之前的 layout
  state = {
    modalVisible: false, // 编辑状态是否可见
    loading: true, //
    setting: false, // 设计状态
    layout: [], // 现有的布局数据
    cards: [], // 现有的布局 对应的 组件
  };

  componentDidMount() {
    // this.loadCards(this.fetchLayout());
    const { dispatch } = this.props;
    dispatch({
      type: 'workplace/fetchLayoutAndInit',
    }).then(res => {
      if (res) {
        this.loadCards(
          res.map(card => {
            const { code, ...rest } = card;
            return { ...rest, i: code };
          })
        );
      }
    });
  }

  renderCard() {
    const { setting = false, cards = [] } = this.state;
    return cards.map(item => {
      if (setting === true) {
        return (
          <div key={item.name}>
            {item.component}
            <div className={styles.dragCard} />
            <Icon
              type="close"
              className={styles.closeBtn}
              onClick={() => {
                this.handleRemoveCard(item.name);
              }}
            />
          </div>
        );
      } else {
        return (
          <div key={item.name} className={styles.boxShadow}>
            {item.component}
          </div>
        );
      }
    });
  }

  /**
   * layout 改变的回调
   */
  @Bind()
  onLayoutChange(layout) {
    // 现在错误的 卡片也会占一个位置了
    // if (layout.length === 1 && layout[0].name === 'error') return;
    this.setState({
      layout,
    });
  }

  /**
   * 保存布局
   */
  @Bind()
  saveLayout() {
    const { layout } = this.state;
    const { dispatch } = this.props;
    this.setState(
      {
        setting: false,
      },
      () => {
        if (layout) {
          const newLayout = cloneDeep(layout);
          const saveParams = newLayout.map(item => {
            const { i, ...rest } = item;
            return {
              ...rest,
              code: i,
            };
          });
          dispatch({
            type: 'workplace/saveLayout',
            payload: [...saveParams],
          })
            .then(res => {
              if (res) {
                notification.success();
                this.originLayout = layout;
              } else {
                this.loadCards(this.originLayout);
              }
            })
            .catch(() => {
              this.loadCards(this.originLayout);
            });
        }
      }
    );
  }

  /**
   * 开始设置布局
   */
  @Bind()
  startSettingLayout() {
    const { layout } = this.state;
    this.setState(
      {
        setting: true,
      },
      () => {
        this.originLayout = layout;
      }
    );
  }

  /**
   * 取消设置布局状态
   */
  @Bind()
  cancelSettingLayout() {
    this.loadCards(this.originLayout);
    this.setState({
      setting: false,
    });
  }

  /**
   * 加载单独的卡片组件, 失败返回 失败的Card
   * @param {string} cardCode - 卡片代码
   * @return {React.Component|null}
   */
  async importCard(cardCode) {
    let loadCard;
    try {
      loadCard = await import(`../Cards/${cardCode}`);
    } catch (e) {
      loadCard = null;
    }
    return loadCard;
  }

  /**
   * 加载所有的卡片组件
   */
  async importCards(...cards) {
    return Promise.all(cards.map(cardCode => this.importCard(cardCode)));
  }

  /**
   * 将 卡片 加载成 layout
   */
  @Bind()
  loadCards(layouts = []) {
    const layout = layouts;
    const cs = layout.map(c => c.i);
    let cards = [];
    this.importCards(...cs)
      .then(cmps => {
        cards = cs.map((cardCode, index) => {
          const cmp = cmps[index];
          if (cmp && cmp.default) {
            const WorkplaceCard = cmp.default;
            return {
              name: cardCode,
              component: <WorkplaceCard />,
            };
          } else {
            return {
              name: cardCode,
              component: (
                <Card title="Error">
                  {intl.get('hpfm.workplace.view.message.loadCardError').d('加载卡片失败')}
                </Card>
              ),
            };
          }
        });
      })
      // 不会出错了
      // TODO: 还是需要检查一下
      // .catch(error => {
      //   layout = [{ code: 'error', x: 0, y: 0, w: 12, h: 10 }];
      //   cards = [
      //     {
      //       name: 'error',
      //       component: <Card title="Error">{`${error}`}</Card>,
      //     },
      //   ];
      // })
      .finally(() => {
        this.setState({
          loading: false,
          layout,
          cards,
        });
      });
  }

  /**
   * 移除指定 code 的卡片
   */
  @Bind()
  handleRemoveCard(code) {
    const { layout = [] } = this.state;
    const layouts = layout.filter(l => l.i !== code);
    if (layouts.length === layout.length) {
      // 已经移除了 不要重复移除
      // FIXME: 是否在 CardsSetting 中判断
    }
    this.loadCards(layouts);
  }

  @Bind()
  handleAddCard(card) {
    const { layout = [] } = this.state;
    if (layout.some(l => l.i === card.code)) {
      // 已经添加了 不要重复添加
      // FIXME: 是否在 CardsSetting 中判断
      return;
    }
    const { code, ...rest } = card;
    const layouts = [
      ...layout,
      {
        ...rest,
        i: code,
      },
    ];
    this.loadCards(layouts);
  }

  /**
   * 关闭卡片设置页面
   */
  @Bind()
  hideModal() {
    this.setState({
      modalVisible: false,
    });
  }

  /**
   * 打开卡片设置页面
   * 先打开 卡片设置页面, 同时加载可以分配的卡片
   */
  @Bind()
  showModal() {
    this.setState({
      modalVisible: true,
    });
  }

  /**
   * 加载可以分配的卡片
   */
  @Bind()
  loadAssignableCards() {
    const {
      dispatch,
      workplace: { roleCards },
    } = this.props;
    return dispatch({
      type: 'workplace/fetchCards',
      payload: {
        roleCards,
      },
    });
  }

  render() {
    const {
      workplace: { prevRoleCards, roleCards = [], catalogType = [] },
      loadAssignableCardsLoading,
    } = this.props;
    const { setting = false, layout = [], loading = true, modalVisible = false } = this.state;
    const allCards = this.renderCard();
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.workplace.view.title.myWorkplace').d('我的工作台')}>
          {loading !== true && (
            <div style={{ flex: '1 auto' }}>
              {setting === true ? (
                <React.Fragment>
                  <Button type="primary" style={buttonStyle} onClick={this.saveLayout}>
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>
                  <Button style={buttonStyle} onClick={this.cancelSettingLayout}>
                    {intl.get('hzero.common.button.cancel').d('取消')}
                  </Button>
                  <Button icon="setting" type="dashed" style={buttonStyle} onClick={this.showModal}>
                    {intl.get('hpfm.card.view.title.cardsSetting').d('卡片设置')}
                  </Button>
                </React.Fragment>
              ) : (
                <Button
                  icon="layout"
                  style={setLayoutButtonStyle}
                  onClick={this.startSettingLayout}
                >
                  {intl.get('hzero.common.button.settingLayout').d('设置布局')}
                </Button>
              )}
            </div>
          )}
        </Header>
        <Content noCard style={pageContentStyle}>
          {loading === true ? (
            <Card loading />
          ) : (
            <ReactGridLayout
              style={layoutContainerStyle}
              layout={layout}
              className={styles.gridLayoutContainer}
              isDraggable={setting}
              isResizable={setting}
              cols={20}
              rowHeight={28}
              margin={[12, 12]}
              onLayoutChange={this.onLayoutChange}
            >
              {allCards}
            </ReactGridLayout>
          )}
          <CardsSetting
            loading={loadAssignableCardsLoading}
            loadAssignableCards={this.loadAssignableCards}
            onRemoveCard={this.handleRemoveCard}
            onAddCard={this.handleAddCard}
            onCancel={this.hideModal}
            loadCards={this.loadCards}
            prevRoleCards={prevRoleCards}
            roleCards={roleCards}
            visible={modalVisible}
            layout={layout}
            catalogType={catalogType}
          />
        </Content>
      </React.Fragment>
    );
  }
}
