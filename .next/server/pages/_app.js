/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./lib/web3.js":
/*!*********************!*\
  !*** ./lib/web3.js ***!
  \*********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CONTRACT_ADDRESSES: () => (/* binding */ CONTRACT_ADDRESSES),\n/* harmony export */   MOVIE_ARTICLE_ABI: () => (/* binding */ MOVIE_ARTICLE_ABI),\n/* harmony export */   REWARD_TOKEN_ABI: () => (/* binding */ REWARD_TOKEN_ABI),\n/* harmony export */   chains: () => (/* binding */ chains),\n/* harmony export */   wagmiConfig: () => (/* binding */ wagmiConfig)\n/* harmony export */ });\n/* harmony import */ var _rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @rainbow-me/rainbowkit */ \"@rainbow-me/rainbowkit\");\n/* harmony import */ var wagmi__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! wagmi */ \"wagmi\");\n/* harmony import */ var wagmi_chains__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! wagmi/chains */ \"wagmi/chains\");\n/* harmony import */ var wagmi_providers_public__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! wagmi/providers/public */ \"wagmi/providers/public\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_0__, wagmi__WEBPACK_IMPORTED_MODULE_1__, wagmi_chains__WEBPACK_IMPORTED_MODULE_2__, wagmi_providers_public__WEBPACK_IMPORTED_MODULE_3__]);\n([_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_0__, wagmi__WEBPACK_IMPORTED_MODULE_1__, wagmi_chains__WEBPACK_IMPORTED_MODULE_2__, wagmi_providers_public__WEBPACK_IMPORTED_MODULE_3__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n// Configure chains\nconst { chains, publicClient } = (0,wagmi__WEBPACK_IMPORTED_MODULE_1__.configureChains)([\n    wagmi_chains__WEBPACK_IMPORTED_MODULE_2__.hardhat,\n    wagmi_chains__WEBPACK_IMPORTED_MODULE_2__.localhost\n], [\n    (0,wagmi_providers_public__WEBPACK_IMPORTED_MODULE_3__.publicProvider)()\n]);\n// Configure wallets\nconst { connectors } = (0,_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_0__.getDefaultWallets)({\n    appName: \"Movie Article Web3\",\n    projectId: \"YOUR_PROJECT_ID\",\n    chains\n});\n// Create wagmi config\nconst wagmiConfig = (0,wagmi__WEBPACK_IMPORTED_MODULE_1__.createConfig)({\n    autoConnect: true,\n    connectors,\n    publicClient\n});\n\n// Contract addresses (updated with deployed addresses)\nconst CONTRACT_ADDRESSES = {\n    MOVIE_ARTICLE: \"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512\",\n    REWARD_TOKEN: \"0x5FbDB2315678afecb367f032d93F642f64180aa3\"\n};\n// Simplified ABI for basic functionality\nconst MOVIE_ARTICLE_ABI = [\n    \"function createArticle(string memory _title, string memory _movieTitle, string memory _genre, uint256 _minContributionLength, uint256 _maxContributors) external returns (uint256)\",\n    \"function addContribution(uint256 _articleId, string memory _content) external\",\n    \"function likeContribution(uint256 _contributionId) external\",\n    \"function approveContribution(uint256 _contributionId, uint256 _reward) external\",\n    \"function completeArticle(uint256 _articleId) external\",\n    \"function articles(uint256) external view returns (uint256 id, string memory title, string memory movieTitle, string memory genre, address creator, uint256 createdAt, uint256 totalContributions, uint256 totalRewards, bool isCompleted, uint256 minContributionLength, uint256 maxContributors)\",\n    \"function contributions(uint256) external view returns (uint256 id, uint256 articleId, address contributor, string memory content, uint256 timestamp, uint256 likes, uint256 rewards, bool isApproved)\",\n    \"function getTotalArticles() external view returns (uint256)\",\n    \"function getTotalContributions() external view returns (uint256)\",\n    \"function getArticleContributions(uint256 _articleId) external view returns (uint256[] memory)\",\n    \"function getUserContributions(address _user) external view returns (uint256[] memory)\",\n    \"function hasContributed(uint256, address) external view returns (bool)\",\n    \"function hasLiked(uint256, address) external view returns (bool)\",\n    \"event ArticleCreated(uint256 indexed articleId, address indexed creator, string title)\",\n    \"event ContributionAdded(uint256 indexed contributionId, uint256 indexed articleId, address indexed contributor)\",\n    \"event ContributionLiked(uint256 indexed contributionId, address indexed liker)\",\n    \"event ContributionApproved(uint256 indexed contributionId, uint256 reward)\",\n    \"event ArticleCompleted(uint256 indexed articleId, uint256 totalRewards)\"\n];\nconst REWARD_TOKEN_ABI = [\n    \"function name() external view returns (string memory)\",\n    \"function symbol() external view returns (string memory)\",\n    \"function decimals() external view returns (uint8)\",\n    \"function totalSupply() external view returns (uint256)\",\n    \"function balanceOf(address account) external view returns (uint256)\",\n    \"function transfer(address to, uint256 amount) external returns (bool)\",\n    \"function allowance(address owner, address spender) external view returns (uint256)\",\n    \"function approve(address spender, uint256 amount) external returns (bool)\",\n    \"function transferFrom(address from, address to, uint256 amount) external returns (bool)\",\n    \"function mint(address to, uint256 amount) external\",\n    \"function burn(uint256 amount) external\",\n    \"event Transfer(address indexed from, address indexed to, uint256 value)\",\n    \"event Approval(address indexed owner, address indexed spender, uint256 value)\"\n];\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvd2ViMy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBMkQ7QUFDTDtBQUNKO0FBQ007QUFFeEQsbUJBQW1CO0FBQ25CLE1BQU0sRUFBRU0sTUFBTSxFQUFFQyxZQUFZLEVBQUUsR0FBR04sc0RBQWVBLENBQzlDO0lBQUNFLGlEQUFPQTtJQUFFQyxtREFBU0E7Q0FBQyxFQUNwQjtJQUFDQyxzRUFBY0E7Q0FBRztBQUdwQixvQkFBb0I7QUFDcEIsTUFBTSxFQUFFRyxVQUFVLEVBQUUsR0FBR1IseUVBQWlCQSxDQUFDO0lBQ3ZDUyxTQUFTO0lBQ1RDLFdBQVc7SUFDWEo7QUFDRjtBQUVBLHNCQUFzQjtBQUNmLE1BQU1LLGNBQWNULG1EQUFZQSxDQUFDO0lBQ3RDVSxhQUFhO0lBQ2JKO0lBQ0FEO0FBQ0YsR0FBRztBQUVlO0FBRWxCLHVEQUF1RDtBQUNoRCxNQUFNTSxxQkFBcUI7SUFDaENDLGVBQWU7SUFDZkMsY0FBYztBQUNoQixFQUFFO0FBRUYseUNBQXlDO0FBQ2xDLE1BQU1DLG9CQUFvQjtJQUMvQjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7Q0FDRCxDQUFDO0FBRUssTUFBTUMsbUJBQW1CO0lBQzlCO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0NBQ0QsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL21vdmllLWFydGljbGUtd2ViMy8uL2xpYi93ZWIzLmpzPzYwYTUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0RGVmYXVsdFdhbGxldHMgfSBmcm9tICdAcmFpbmJvdy1tZS9yYWluYm93a2l0JztcclxuaW1wb3J0IHsgY29uZmlndXJlQ2hhaW5zLCBjcmVhdGVDb25maWcgfSBmcm9tICd3YWdtaSc7XHJcbmltcG9ydCB7IGhhcmRoYXQsIGxvY2FsaG9zdCB9IGZyb20gJ3dhZ21pL2NoYWlucyc7XHJcbmltcG9ydCB7IHB1YmxpY1Byb3ZpZGVyIH0gZnJvbSAnd2FnbWkvcHJvdmlkZXJzL3B1YmxpYyc7XHJcblxyXG4vLyBDb25maWd1cmUgY2hhaW5zXHJcbmNvbnN0IHsgY2hhaW5zLCBwdWJsaWNDbGllbnQgfSA9IGNvbmZpZ3VyZUNoYWlucyhcclxuICBbaGFyZGhhdCwgbG9jYWxob3N0XSxcclxuICBbcHVibGljUHJvdmlkZXIoKV1cclxuKTtcclxuXHJcbi8vIENvbmZpZ3VyZSB3YWxsZXRzXHJcbmNvbnN0IHsgY29ubmVjdG9ycyB9ID0gZ2V0RGVmYXVsdFdhbGxldHMoe1xyXG4gIGFwcE5hbWU6ICdNb3ZpZSBBcnRpY2xlIFdlYjMnLFxyXG4gIHByb2plY3RJZDogJ1lPVVJfUFJPSkVDVF9JRCcsIC8vIEdldCBmcm9tIFdhbGxldENvbm5lY3QgQ2xvdWRcclxuICBjaGFpbnNcclxufSk7XHJcblxyXG4vLyBDcmVhdGUgd2FnbWkgY29uZmlnXHJcbmV4cG9ydCBjb25zdCB3YWdtaUNvbmZpZyA9IGNyZWF0ZUNvbmZpZyh7XHJcbiAgYXV0b0Nvbm5lY3Q6IHRydWUsXHJcbiAgY29ubmVjdG9ycyxcclxuICBwdWJsaWNDbGllbnRcclxufSk7XHJcblxyXG5leHBvcnQgeyBjaGFpbnMgfTtcclxuXHJcbi8vIENvbnRyYWN0IGFkZHJlc3NlcyAodXBkYXRlZCB3aXRoIGRlcGxveWVkIGFkZHJlc3NlcylcclxuZXhwb3J0IGNvbnN0IENPTlRSQUNUX0FERFJFU1NFUyA9IHtcclxuICBNT1ZJRV9BUlRJQ0xFOiAnMHhlN2YxNzI1RTc3MzRDRTI4OEY4MzY3ZTFCYjE0M0U5MGJiM0YwNTEyJyxcclxuICBSRVdBUkRfVE9LRU46ICcweDVGYkRCMjMxNTY3OGFmZWNiMzY3ZjAzMmQ5M0Y2NDJmNjQxODBhYTMnXHJcbn07XHJcblxyXG4vLyBTaW1wbGlmaWVkIEFCSSBmb3IgYmFzaWMgZnVuY3Rpb25hbGl0eVxyXG5leHBvcnQgY29uc3QgTU9WSUVfQVJUSUNMRV9BQkkgPSBbXHJcbiAgXCJmdW5jdGlvbiBjcmVhdGVBcnRpY2xlKHN0cmluZyBtZW1vcnkgX3RpdGxlLCBzdHJpbmcgbWVtb3J5IF9tb3ZpZVRpdGxlLCBzdHJpbmcgbWVtb3J5IF9nZW5yZSwgdWludDI1NiBfbWluQ29udHJpYnV0aW9uTGVuZ3RoLCB1aW50MjU2IF9tYXhDb250cmlidXRvcnMpIGV4dGVybmFsIHJldHVybnMgKHVpbnQyNTYpXCIsXHJcbiAgXCJmdW5jdGlvbiBhZGRDb250cmlidXRpb24odWludDI1NiBfYXJ0aWNsZUlkLCBzdHJpbmcgbWVtb3J5IF9jb250ZW50KSBleHRlcm5hbFwiLFxyXG4gIFwiZnVuY3Rpb24gbGlrZUNvbnRyaWJ1dGlvbih1aW50MjU2IF9jb250cmlidXRpb25JZCkgZXh0ZXJuYWxcIixcclxuICBcImZ1bmN0aW9uIGFwcHJvdmVDb250cmlidXRpb24odWludDI1NiBfY29udHJpYnV0aW9uSWQsIHVpbnQyNTYgX3Jld2FyZCkgZXh0ZXJuYWxcIixcclxuICBcImZ1bmN0aW9uIGNvbXBsZXRlQXJ0aWNsZSh1aW50MjU2IF9hcnRpY2xlSWQpIGV4dGVybmFsXCIsXHJcbiAgXCJmdW5jdGlvbiBhcnRpY2xlcyh1aW50MjU2KSBleHRlcm5hbCB2aWV3IHJldHVybnMgKHVpbnQyNTYgaWQsIHN0cmluZyBtZW1vcnkgdGl0bGUsIHN0cmluZyBtZW1vcnkgbW92aWVUaXRsZSwgc3RyaW5nIG1lbW9yeSBnZW5yZSwgYWRkcmVzcyBjcmVhdG9yLCB1aW50MjU2IGNyZWF0ZWRBdCwgdWludDI1NiB0b3RhbENvbnRyaWJ1dGlvbnMsIHVpbnQyNTYgdG90YWxSZXdhcmRzLCBib29sIGlzQ29tcGxldGVkLCB1aW50MjU2IG1pbkNvbnRyaWJ1dGlvbkxlbmd0aCwgdWludDI1NiBtYXhDb250cmlidXRvcnMpXCIsXHJcbiAgXCJmdW5jdGlvbiBjb250cmlidXRpb25zKHVpbnQyNTYpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAodWludDI1NiBpZCwgdWludDI1NiBhcnRpY2xlSWQsIGFkZHJlc3MgY29udHJpYnV0b3IsIHN0cmluZyBtZW1vcnkgY29udGVudCwgdWludDI1NiB0aW1lc3RhbXAsIHVpbnQyNTYgbGlrZXMsIHVpbnQyNTYgcmV3YXJkcywgYm9vbCBpc0FwcHJvdmVkKVwiLFxyXG4gIFwiZnVuY3Rpb24gZ2V0VG90YWxBcnRpY2xlcygpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAodWludDI1NilcIixcclxuICBcImZ1bmN0aW9uIGdldFRvdGFsQ29udHJpYnV0aW9ucygpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAodWludDI1NilcIixcclxuICBcImZ1bmN0aW9uIGdldEFydGljbGVDb250cmlidXRpb25zKHVpbnQyNTYgX2FydGljbGVJZCkgZXh0ZXJuYWwgdmlldyByZXR1cm5zICh1aW50MjU2W10gbWVtb3J5KVwiLFxyXG4gIFwiZnVuY3Rpb24gZ2V0VXNlckNvbnRyaWJ1dGlvbnMoYWRkcmVzcyBfdXNlcikgZXh0ZXJuYWwgdmlldyByZXR1cm5zICh1aW50MjU2W10gbWVtb3J5KVwiLFxyXG4gIFwiZnVuY3Rpb24gaGFzQ29udHJpYnV0ZWQodWludDI1NiwgYWRkcmVzcykgZXh0ZXJuYWwgdmlldyByZXR1cm5zIChib29sKVwiLFxyXG4gIFwiZnVuY3Rpb24gaGFzTGlrZWQodWludDI1NiwgYWRkcmVzcykgZXh0ZXJuYWwgdmlldyByZXR1cm5zIChib29sKVwiLFxyXG4gIFwiZXZlbnQgQXJ0aWNsZUNyZWF0ZWQodWludDI1NiBpbmRleGVkIGFydGljbGVJZCwgYWRkcmVzcyBpbmRleGVkIGNyZWF0b3IsIHN0cmluZyB0aXRsZSlcIixcclxuICBcImV2ZW50IENvbnRyaWJ1dGlvbkFkZGVkKHVpbnQyNTYgaW5kZXhlZCBjb250cmlidXRpb25JZCwgdWludDI1NiBpbmRleGVkIGFydGljbGVJZCwgYWRkcmVzcyBpbmRleGVkIGNvbnRyaWJ1dG9yKVwiLFxyXG4gIFwiZXZlbnQgQ29udHJpYnV0aW9uTGlrZWQodWludDI1NiBpbmRleGVkIGNvbnRyaWJ1dGlvbklkLCBhZGRyZXNzIGluZGV4ZWQgbGlrZXIpXCIsXHJcbiAgXCJldmVudCBDb250cmlidXRpb25BcHByb3ZlZCh1aW50MjU2IGluZGV4ZWQgY29udHJpYnV0aW9uSWQsIHVpbnQyNTYgcmV3YXJkKVwiLFxyXG4gIFwiZXZlbnQgQXJ0aWNsZUNvbXBsZXRlZCh1aW50MjU2IGluZGV4ZWQgYXJ0aWNsZUlkLCB1aW50MjU2IHRvdGFsUmV3YXJkcylcIlxyXG5dO1xyXG5cclxuZXhwb3J0IGNvbnN0IFJFV0FSRF9UT0tFTl9BQkkgPSBbXHJcbiAgXCJmdW5jdGlvbiBuYW1lKCkgZXh0ZXJuYWwgdmlldyByZXR1cm5zIChzdHJpbmcgbWVtb3J5KVwiLFxyXG4gIFwiZnVuY3Rpb24gc3ltYm9sKCkgZXh0ZXJuYWwgdmlldyByZXR1cm5zIChzdHJpbmcgbWVtb3J5KVwiLFxyXG4gIFwiZnVuY3Rpb24gZGVjaW1hbHMoKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKHVpbnQ4KVwiLFxyXG4gIFwiZnVuY3Rpb24gdG90YWxTdXBwbHkoKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKHVpbnQyNTYpXCIsXHJcbiAgXCJmdW5jdGlvbiBiYWxhbmNlT2YoYWRkcmVzcyBhY2NvdW50KSBleHRlcm5hbCB2aWV3IHJldHVybnMgKHVpbnQyNTYpXCIsXHJcbiAgXCJmdW5jdGlvbiB0cmFuc2ZlcihhZGRyZXNzIHRvLCB1aW50MjU2IGFtb3VudCkgZXh0ZXJuYWwgcmV0dXJucyAoYm9vbClcIixcclxuICBcImZ1bmN0aW9uIGFsbG93YW5jZShhZGRyZXNzIG93bmVyLCBhZGRyZXNzIHNwZW5kZXIpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAodWludDI1NilcIixcclxuICBcImZ1bmN0aW9uIGFwcHJvdmUoYWRkcmVzcyBzcGVuZGVyLCB1aW50MjU2IGFtb3VudCkgZXh0ZXJuYWwgcmV0dXJucyAoYm9vbClcIixcclxuICBcImZ1bmN0aW9uIHRyYW5zZmVyRnJvbShhZGRyZXNzIGZyb20sIGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSBleHRlcm5hbCByZXR1cm5zIChib29sKVwiLFxyXG4gIFwiZnVuY3Rpb24gbWludChhZGRyZXNzIHRvLCB1aW50MjU2IGFtb3VudCkgZXh0ZXJuYWxcIixcclxuICBcImZ1bmN0aW9uIGJ1cm4odWludDI1NiBhbW91bnQpIGV4dGVybmFsXCIsXHJcbiAgXCJldmVudCBUcmFuc2ZlcihhZGRyZXNzIGluZGV4ZWQgZnJvbSwgYWRkcmVzcyBpbmRleGVkIHRvLCB1aW50MjU2IHZhbHVlKVwiLFxyXG4gIFwiZXZlbnQgQXBwcm92YWwoYWRkcmVzcyBpbmRleGVkIG93bmVyLCBhZGRyZXNzIGluZGV4ZWQgc3BlbmRlciwgdWludDI1NiB2YWx1ZSlcIlxyXG5dOyAiXSwibmFtZXMiOlsiZ2V0RGVmYXVsdFdhbGxldHMiLCJjb25maWd1cmVDaGFpbnMiLCJjcmVhdGVDb25maWciLCJoYXJkaGF0IiwibG9jYWxob3N0IiwicHVibGljUHJvdmlkZXIiLCJjaGFpbnMiLCJwdWJsaWNDbGllbnQiLCJjb25uZWN0b3JzIiwiYXBwTmFtZSIsInByb2plY3RJZCIsIndhZ21pQ29uZmlnIiwiYXV0b0Nvbm5lY3QiLCJDT05UUkFDVF9BRERSRVNTRVMiLCJNT1ZJRV9BUlRJQ0xFIiwiUkVXQVJEX1RPS0VOIiwiTU9WSUVfQVJUSUNMRV9BQkkiLCJSRVdBUkRfVE9LRU5fQUJJIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./lib/web3.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _rainbow_me_rainbowkit_styles_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @rainbow-me/rainbowkit/styles.css */ \"./node_modules/@rainbow-me/rainbowkit/dist/index.css\");\n/* harmony import */ var _rainbow_me_rainbowkit_styles_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_rainbow_me_rainbowkit_styles_css__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @rainbow-me/rainbowkit */ \"@rainbow-me/rainbowkit\");\n/* harmony import */ var wagmi__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! wagmi */ \"wagmi\");\n/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tanstack/react-query */ \"@tanstack/react-query\");\n/* harmony import */ var _lib_web3__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/lib/web3 */ \"./lib/web3.js\");\n/* harmony import */ var react_hot_toast__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-hot-toast */ \"react-hot-toast\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_3__, wagmi__WEBPACK_IMPORTED_MODULE_4__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_5__, _lib_web3__WEBPACK_IMPORTED_MODULE_6__, react_hot_toast__WEBPACK_IMPORTED_MODULE_7__]);\n([_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_3__, wagmi__WEBPACK_IMPORTED_MODULE_4__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_5__, _lib_web3__WEBPACK_IMPORTED_MODULE_6__, react_hot_toast__WEBPACK_IMPORTED_MODULE_7__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\n\n\nconst queryClient = new _tanstack_react_query__WEBPACK_IMPORTED_MODULE_5__.QueryClient();\nfunction App({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(wagmi__WEBPACK_IMPORTED_MODULE_4__.WagmiConfig, {\n        config: _lib_web3__WEBPACK_IMPORTED_MODULE_6__.wagmiConfig,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_5__.QueryClientProvider, {\n            client: queryClient,\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_3__.RainbowKitProvider, {\n                chains: _lib_web3__WEBPACK_IMPORTED_MODULE_6__.chains,\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                        ...pageProps\n                    }, void 0, false, {\n                        fileName: \"G:\\\\web3\\\\pages\\\\_app.js\",\n                        lineNumber: 16,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_hot_toast__WEBPACK_IMPORTED_MODULE_7__.Toaster, {\n                        position: \"top-right\"\n                    }, void 0, false, {\n                        fileName: \"G:\\\\web3\\\\pages\\\\_app.js\",\n                        lineNumber: 17,\n                        columnNumber: 11\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"G:\\\\web3\\\\pages\\\\_app.js\",\n                lineNumber: 15,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"G:\\\\web3\\\\pages\\\\_app.js\",\n            lineNumber: 14,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"G:\\\\web3\\\\pages\\\\_app.js\",\n        lineNumber: 13,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBOEI7QUFDYTtBQUNpQjtBQUN4QjtBQUNxQztBQUN4QjtBQUNQO0FBRTFDLE1BQU1PLGNBQWMsSUFBSUwsOERBQVdBO0FBRXBCLFNBQVNNLElBQUksRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQUU7SUFDbEQscUJBQ0UsOERBQUNULDhDQUFXQTtRQUFDVSxRQUFRTixrREFBV0E7a0JBQzlCLDRFQUFDRixzRUFBbUJBO1lBQUNTLFFBQVFMO3NCQUMzQiw0RUFBQ1Asc0VBQWtCQTtnQkFBQ0ksUUFBUUEsNkNBQU1BOztrQ0FDaEMsOERBQUNLO3dCQUFXLEdBQUdDLFNBQVM7Ozs7OztrQ0FDeEIsOERBQUNKLG9EQUFPQTt3QkFBQ08sVUFBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUs1QiIsInNvdXJjZXMiOlsid2VicGFjazovL21vdmllLWFydGljbGUtd2ViMy8uL3BhZ2VzL19hcHAuanM/ZTBhZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ0Avc3R5bGVzL2dsb2JhbHMuY3NzJztcclxuaW1wb3J0ICdAcmFpbmJvdy1tZS9yYWluYm93a2l0L3N0eWxlcy5jc3MnO1xyXG5pbXBvcnQgeyBSYWluYm93S2l0UHJvdmlkZXIgfSBmcm9tICdAcmFpbmJvdy1tZS9yYWluYm93a2l0JztcclxuaW1wb3J0IHsgV2FnbWlDb25maWcgfSBmcm9tICd3YWdtaSc7XHJcbmltcG9ydCB7IFF1ZXJ5Q2xpZW50LCBRdWVyeUNsaWVudFByb3ZpZGVyIH0gZnJvbSAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JztcclxuaW1wb3J0IHsgY2hhaW5zLCB3YWdtaUNvbmZpZyB9IGZyb20gJ0AvbGliL3dlYjMnO1xyXG5pbXBvcnQgeyBUb2FzdGVyIH0gZnJvbSAncmVhY3QtaG90LXRvYXN0JztcclxuXHJcbmNvbnN0IHF1ZXJ5Q2xpZW50ID0gbmV3IFF1ZXJ5Q2xpZW50KCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9KSB7XHJcbiAgcmV0dXJuIChcclxuICAgIDxXYWdtaUNvbmZpZyBjb25maWc9e3dhZ21pQ29uZmlnfT5cclxuICAgICAgPFF1ZXJ5Q2xpZW50UHJvdmlkZXIgY2xpZW50PXtxdWVyeUNsaWVudH0+XHJcbiAgICAgICAgPFJhaW5ib3dLaXRQcm92aWRlciBjaGFpbnM9e2NoYWluc30+XHJcbiAgICAgICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XHJcbiAgICAgICAgICA8VG9hc3RlciBwb3NpdGlvbj1cInRvcC1yaWdodFwiIC8+XHJcbiAgICAgICAgPC9SYWluYm93S2l0UHJvdmlkZXI+XHJcbiAgICAgIDwvUXVlcnlDbGllbnRQcm92aWRlcj5cclxuICAgIDwvV2FnbWlDb25maWc+XHJcbiAgKTtcclxufSAiXSwibmFtZXMiOlsiUmFpbmJvd0tpdFByb3ZpZGVyIiwiV2FnbWlDb25maWciLCJRdWVyeUNsaWVudCIsIlF1ZXJ5Q2xpZW50UHJvdmlkZXIiLCJjaGFpbnMiLCJ3YWdtaUNvbmZpZyIsIlRvYXN0ZXIiLCJxdWVyeUNsaWVudCIsIkFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsImNvbmZpZyIsImNsaWVudCIsInBvc2l0aW9uIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "@rainbow-me/rainbowkit":
/*!*****************************************!*\
  !*** external "@rainbow-me/rainbowkit" ***!
  \*****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@rainbow-me/rainbowkit");;

/***/ }),

/***/ "@tanstack/react-query":
/*!****************************************!*\
  !*** external "@tanstack/react-query" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@tanstack/react-query");;

/***/ }),

/***/ "react-hot-toast":
/*!**********************************!*\
  !*** external "react-hot-toast" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = import("react-hot-toast");;

/***/ }),

/***/ "wagmi":
/*!************************!*\
  !*** external "wagmi" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = import("wagmi");;

/***/ }),

/***/ "wagmi/chains":
/*!*******************************!*\
  !*** external "wagmi/chains" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = import("wagmi/chains");;

/***/ }),

/***/ "wagmi/providers/public":
/*!*****************************************!*\
  !*** external "wagmi/providers/public" ***!
  \*****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("wagmi/providers/public");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@rainbow-me"], () => (__webpack_exec__("./pages/_app.js")));
module.exports = __webpack_exports__;

})();