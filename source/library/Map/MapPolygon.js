"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapPolygon = void 0;
const React = __importStar(require("react"));
const decorateMapComponent_1 = __importStar(require("./decorateMapComponent"));
class MapPolygon extends React.Component {
    getNativeComponent;
    getMapManagerCommand;
    getUIManagerCommand;
    polygon;
    constructor(props) {
        super(props);
        this.polygon = React.createRef();
    }
    setNativeProps(props) {
        this.polygon.current?.setNativeProps(props);
    }
    render() {
        const { strokeColor = '#000', strokeWidth = 1 } = this.props;
        const AIRMapPolygon = this.getNativeComponent();
        return (<AIRMapPolygon {...this.props} strokeColor={strokeColor} strokeWidth={strokeWidth} ref={this.polygon}/>);
    }
}
exports.MapPolygon = MapPolygon;
exports.default = (0, decorateMapComponent_1.default)(MapPolygon, 'Polygon', {
    google: {
        ios: decorateMapComponent_1.SUPPORTED,
        android: decorateMapComponent_1.USES_DEFAULT_IMPLEMENTATION,
    },
});
