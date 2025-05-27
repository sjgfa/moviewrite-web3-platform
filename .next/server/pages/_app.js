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
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CONTRACT_ADDRESSES: () => (/* binding */ CONTRACT_ADDRESSES),\n/* harmony export */   MOVIE_ARTICLE_ABI: () => (/* binding */ MOVIE_ARTICLE_ABI),\n/* harmony export */   REWARD_TOKEN_ABI: () => (/* binding */ REWARD_TOKEN_ABI),\n/* harmony export */   chains: () => (/* binding */ chains),\n/* harmony export */   formatAddress: () => (/* binding */ formatAddress),\n/* harmony export */   formatDate: () => (/* binding */ formatDate),\n/* harmony export */   formatDateTime: () => (/* binding */ formatDateTime),\n/* harmony export */   wagmiConfig: () => (/* binding */ wagmiConfig)\n/* harmony export */ });\n/* harmony import */ var _rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @rainbow-me/rainbowkit */ \"@rainbow-me/rainbowkit\");\n/* harmony import */ var wagmi__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! wagmi */ \"wagmi\");\n/* harmony import */ var wagmi_chains__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! wagmi/chains */ \"wagmi/chains\");\n/* harmony import */ var wagmi_providers_public__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! wagmi/providers/public */ \"wagmi/providers/public\");\n/* harmony import */ var _contract_addresses_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../contract-addresses.json */ \"./contract-addresses.json\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_0__, wagmi__WEBPACK_IMPORTED_MODULE_1__, wagmi_chains__WEBPACK_IMPORTED_MODULE_2__, wagmi_providers_public__WEBPACK_IMPORTED_MODULE_3__]);\n([_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_0__, wagmi__WEBPACK_IMPORTED_MODULE_1__, wagmi_chains__WEBPACK_IMPORTED_MODULE_2__, wagmi_providers_public__WEBPACK_IMPORTED_MODULE_3__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n// Configure chains\nconst { chains, publicClient } = (0,wagmi__WEBPACK_IMPORTED_MODULE_1__.configureChains)([\n    wagmi_chains__WEBPACK_IMPORTED_MODULE_2__.hardhat,\n    wagmi_chains__WEBPACK_IMPORTED_MODULE_2__.localhost\n], [\n    (0,wagmi_providers_public__WEBPACK_IMPORTED_MODULE_3__.publicProvider)()\n]);\n// Configure wallets\nconst { connectors } = (0,_rainbow_me_rainbowkit__WEBPACK_IMPORTED_MODULE_0__.getDefaultWallets)({\n    appName: \"Movie Article Web3\",\n    projectId: \"YOUR_PROJECT_ID\",\n    chains\n});\n// Create wagmi config\nconst wagmiConfig = (0,wagmi__WEBPACK_IMPORTED_MODULE_1__.createConfig)({\n    autoConnect: true,\n    connectors,\n    publicClient\n});\n\n// Contract addresses (从配置文件读取)\nconst CONTRACT_ADDRESSES = {\n    MOVIE_ARTICLE: _contract_addresses_json__WEBPACK_IMPORTED_MODULE_4__.movieArticle || \"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512\",\n    REWARD_TOKEN: _contract_addresses_json__WEBPACK_IMPORTED_MODULE_4__.rewardToken || \"0x5FbDB2315678afecb367f032d93F642f64180aa3\"\n};\n// Simplified ABI for basic functionality\nconst MOVIE_ARTICLE_ABI = [\n    \"function createArticle(string memory _title, string memory _movieTitle, string memory _genre, uint256 _minContributionLength, uint256 _maxContributors) external returns (uint256)\",\n    \"function addContribution(uint256 _articleId, string memory _content) external\",\n    \"function likeContribution(uint256 _contributionId) external\",\n    \"function approveContribution(uint256 _contributionId, uint256 _reward) external\",\n    \"function completeArticle(uint256 _articleId) external\",\n    \"function articles(uint256) external view returns (uint256 id, string memory title, string memory movieTitle, string memory genre, address creator, uint256 createdAt, uint256 totalContributions, uint256 totalRewards, bool isCompleted, uint256 minContributionLength, uint256 maxContributors)\",\n    \"function contributions(uint256) external view returns (uint256 id, uint256 articleId, address contributor, string memory content, uint256 timestamp, uint256 likes, uint256 rewards, bool isApproved)\",\n    \"function getTotalArticles() external view returns (uint256)\",\n    \"function getTotalContributions() external view returns (uint256)\",\n    \"function getArticleContributions(uint256 _articleId) external view returns (uint256[] memory)\",\n    \"function getUserContributions(address _user) external view returns (uint256[] memory)\",\n    \"function hasContributed(uint256, address) external view returns (bool)\",\n    \"function hasLiked(uint256, address) external view returns (bool)\",\n    \"event ArticleCreated(uint256 indexed articleId, address indexed creator, string title)\",\n    \"event ContributionAdded(uint256 indexed contributionId, uint256 indexed articleId, address indexed contributor)\",\n    \"event ContributionLiked(uint256 indexed contributionId, address indexed liker)\",\n    \"event ContributionApproved(uint256 indexed contributionId, uint256 reward)\",\n    \"event ArticleCompleted(uint256 indexed articleId, uint256 totalRewards)\"\n];\nconst REWARD_TOKEN_ABI = [\n    \"function name() external view returns (string memory)\",\n    \"function symbol() external view returns (string memory)\",\n    \"function decimals() external view returns (uint8)\",\n    \"function totalSupply() external view returns (uint256)\",\n    \"function balanceOf(address account) external view returns (uint256)\",\n    \"function transfer(address to, uint256 amount) external returns (bool)\",\n    \"function allowance(address owner, address spender) external view returns (uint256)\",\n    \"function approve(address spender, uint256 amount) external returns (bool)\",\n    \"function transferFrom(address from, address to, uint256 amount) external returns (bool)\",\n    \"function mint(address to, uint256 amount) external\",\n    \"function burn(uint256 amount) external\",\n    \"event Transfer(address indexed from, address indexed to, uint256 value)\",\n    \"event Approval(address indexed owner, address indexed spender, uint256 value)\"\n];\n// 工具函数\nconst formatAddress = (address)=>{\n    if (!address) return \"\";\n    return `${address.slice(0, 6)}...${address.slice(-4)}`;\n};\nconst formatDate = (timestamp)=>{\n    if (!timestamp) return \"\";\n    return new Date(Number(timestamp) * 1000).toLocaleDateString(\"zh-CN\");\n};\nconst formatDateTime = (timestamp)=>{\n    if (!timestamp) return \"\";\n    return new Date(Number(timestamp) * 1000).toLocaleString(\"zh-CN\");\n};\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvd2ViMy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQTJEO0FBQ0w7QUFDSjtBQUNNO0FBQ0c7QUFFM0QsbUJBQW1CO0FBQ25CLE1BQU0sRUFBRU8sTUFBTSxFQUFFQyxZQUFZLEVBQUUsR0FBR1Asc0RBQWVBLENBQzlDO0lBQUNFLGlEQUFPQTtJQUFFQyxtREFBU0E7Q0FBQyxFQUNwQjtJQUFDQyxzRUFBY0E7Q0FBRztBQUdwQixvQkFBb0I7QUFDcEIsTUFBTSxFQUFFSSxVQUFVLEVBQUUsR0FBR1QseUVBQWlCQSxDQUFDO0lBQ3ZDVSxTQUFTO0lBQ1RDLFdBQVc7SUFDWEo7QUFDRjtBQUVBLHNCQUFzQjtBQUNmLE1BQU1LLGNBQWNWLG1EQUFZQSxDQUFDO0lBQ3RDVyxhQUFhO0lBQ2JKO0lBQ0FEO0FBQ0YsR0FBRztBQUVlO0FBRWxCLCtCQUErQjtBQUN4QixNQUFNTSxxQkFBcUI7SUFDaENDLGVBQWVULGtFQUE4QixJQUFJO0lBQ2pEVyxjQUFjWCxpRUFBNkIsSUFBSTtBQUNqRCxFQUFFO0FBRUYseUNBQXlDO0FBQ2xDLE1BQU1hLG9CQUFvQjtJQUMvQjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7Q0FDRCxDQUFDO0FBRUssTUFBTUMsbUJBQW1CO0lBQzlCO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0NBQ0QsQ0FBQztBQUVGLE9BQU87QUFDQSxNQUFNQyxnQkFBZ0IsQ0FBQ0M7SUFDNUIsSUFBSSxDQUFDQSxTQUFTLE9BQU87SUFDckIsT0FBTyxDQUFDLEVBQUVBLFFBQVFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFRCxRQUFRQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDeEQsRUFBRTtBQUVLLE1BQU1DLGFBQWEsQ0FBQ0M7SUFDekIsSUFBSSxDQUFDQSxXQUFXLE9BQU87SUFDdkIsT0FBTyxJQUFJQyxLQUFLQyxPQUFPRixhQUFhLE1BQU1HLGtCQUFrQixDQUFDO0FBQy9ELEVBQUU7QUFFSyxNQUFNQyxpQkFBaUIsQ0FBQ0o7SUFDN0IsSUFBSSxDQUFDQSxXQUFXLE9BQU87SUFDdkIsT0FBTyxJQUFJQyxLQUFLQyxPQUFPRixhQUFhLE1BQU1LLGNBQWMsQ0FBQztBQUMzRCxFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbW92aWUtYXJ0aWNsZS13ZWIzLy4vbGliL3dlYjMuanM/NjBhNSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXREZWZhdWx0V2FsbGV0cyB9IGZyb20gJ0ByYWluYm93LW1lL3JhaW5ib3draXQnO1xyXG5pbXBvcnQgeyBjb25maWd1cmVDaGFpbnMsIGNyZWF0ZUNvbmZpZyB9IGZyb20gJ3dhZ21pJztcclxuaW1wb3J0IHsgaGFyZGhhdCwgbG9jYWxob3N0IH0gZnJvbSAnd2FnbWkvY2hhaW5zJztcclxuaW1wb3J0IHsgcHVibGljUHJvdmlkZXIgfSBmcm9tICd3YWdtaS9wcm92aWRlcnMvcHVibGljJztcclxuaW1wb3J0IGNvbnRyYWN0QWRkcmVzc2VzIGZyb20gJy4uL2NvbnRyYWN0LWFkZHJlc3Nlcy5qc29uJztcclxuXHJcbi8vIENvbmZpZ3VyZSBjaGFpbnNcclxuY29uc3QgeyBjaGFpbnMsIHB1YmxpY0NsaWVudCB9ID0gY29uZmlndXJlQ2hhaW5zKFxyXG4gIFtoYXJkaGF0LCBsb2NhbGhvc3RdLFxyXG4gIFtwdWJsaWNQcm92aWRlcigpXVxyXG4pO1xyXG5cclxuLy8gQ29uZmlndXJlIHdhbGxldHNcclxuY29uc3QgeyBjb25uZWN0b3JzIH0gPSBnZXREZWZhdWx0V2FsbGV0cyh7XHJcbiAgYXBwTmFtZTogJ01vdmllIEFydGljbGUgV2ViMycsXHJcbiAgcHJvamVjdElkOiAnWU9VUl9QUk9KRUNUX0lEJywgLy8gR2V0IGZyb20gV2FsbGV0Q29ubmVjdCBDbG91ZFxyXG4gIGNoYWluc1xyXG59KTtcclxuXHJcbi8vIENyZWF0ZSB3YWdtaSBjb25maWdcclxuZXhwb3J0IGNvbnN0IHdhZ21pQ29uZmlnID0gY3JlYXRlQ29uZmlnKHtcclxuICBhdXRvQ29ubmVjdDogdHJ1ZSxcclxuICBjb25uZWN0b3JzLFxyXG4gIHB1YmxpY0NsaWVudFxyXG59KTtcclxuXHJcbmV4cG9ydCB7IGNoYWlucyB9O1xyXG5cclxuLy8gQ29udHJhY3QgYWRkcmVzc2VzICjku47phY3nva7mlofku7bor7vlj5YpXHJcbmV4cG9ydCBjb25zdCBDT05UUkFDVF9BRERSRVNTRVMgPSB7XHJcbiAgTU9WSUVfQVJUSUNMRTogY29udHJhY3RBZGRyZXNzZXMubW92aWVBcnRpY2xlIHx8ICcweGU3ZjE3MjVFNzczNENFMjg4RjgzNjdlMUJiMTQzRTkwYmIzRjA1MTInLFxyXG4gIFJFV0FSRF9UT0tFTjogY29udHJhY3RBZGRyZXNzZXMucmV3YXJkVG9rZW4gfHwgJzB4NUZiREIyMzE1Njc4YWZlY2IzNjdmMDMyZDkzRjY0MmY2NDE4MGFhMydcclxufTtcclxuXHJcbi8vIFNpbXBsaWZpZWQgQUJJIGZvciBiYXNpYyBmdW5jdGlvbmFsaXR5XHJcbmV4cG9ydCBjb25zdCBNT1ZJRV9BUlRJQ0xFX0FCSSA9IFtcclxuICBcImZ1bmN0aW9uIGNyZWF0ZUFydGljbGUoc3RyaW5nIG1lbW9yeSBfdGl0bGUsIHN0cmluZyBtZW1vcnkgX21vdmllVGl0bGUsIHN0cmluZyBtZW1vcnkgX2dlbnJlLCB1aW50MjU2IF9taW5Db250cmlidXRpb25MZW5ndGgsIHVpbnQyNTYgX21heENvbnRyaWJ1dG9ycykgZXh0ZXJuYWwgcmV0dXJucyAodWludDI1NilcIixcclxuICBcImZ1bmN0aW9uIGFkZENvbnRyaWJ1dGlvbih1aW50MjU2IF9hcnRpY2xlSWQsIHN0cmluZyBtZW1vcnkgX2NvbnRlbnQpIGV4dGVybmFsXCIsXHJcbiAgXCJmdW5jdGlvbiBsaWtlQ29udHJpYnV0aW9uKHVpbnQyNTYgX2NvbnRyaWJ1dGlvbklkKSBleHRlcm5hbFwiLFxyXG4gIFwiZnVuY3Rpb24gYXBwcm92ZUNvbnRyaWJ1dGlvbih1aW50MjU2IF9jb250cmlidXRpb25JZCwgdWludDI1NiBfcmV3YXJkKSBleHRlcm5hbFwiLFxyXG4gIFwiZnVuY3Rpb24gY29tcGxldGVBcnRpY2xlKHVpbnQyNTYgX2FydGljbGVJZCkgZXh0ZXJuYWxcIixcclxuICBcImZ1bmN0aW9uIGFydGljbGVzKHVpbnQyNTYpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAodWludDI1NiBpZCwgc3RyaW5nIG1lbW9yeSB0aXRsZSwgc3RyaW5nIG1lbW9yeSBtb3ZpZVRpdGxlLCBzdHJpbmcgbWVtb3J5IGdlbnJlLCBhZGRyZXNzIGNyZWF0b3IsIHVpbnQyNTYgY3JlYXRlZEF0LCB1aW50MjU2IHRvdGFsQ29udHJpYnV0aW9ucywgdWludDI1NiB0b3RhbFJld2FyZHMsIGJvb2wgaXNDb21wbGV0ZWQsIHVpbnQyNTYgbWluQ29udHJpYnV0aW9uTGVuZ3RoLCB1aW50MjU2IG1heENvbnRyaWJ1dG9ycylcIixcclxuICBcImZ1bmN0aW9uIGNvbnRyaWJ1dGlvbnModWludDI1NikgZXh0ZXJuYWwgdmlldyByZXR1cm5zICh1aW50MjU2IGlkLCB1aW50MjU2IGFydGljbGVJZCwgYWRkcmVzcyBjb250cmlidXRvciwgc3RyaW5nIG1lbW9yeSBjb250ZW50LCB1aW50MjU2IHRpbWVzdGFtcCwgdWludDI1NiBsaWtlcywgdWludDI1NiByZXdhcmRzLCBib29sIGlzQXBwcm92ZWQpXCIsXHJcbiAgXCJmdW5jdGlvbiBnZXRUb3RhbEFydGljbGVzKCkgZXh0ZXJuYWwgdmlldyByZXR1cm5zICh1aW50MjU2KVwiLFxyXG4gIFwiZnVuY3Rpb24gZ2V0VG90YWxDb250cmlidXRpb25zKCkgZXh0ZXJuYWwgdmlldyByZXR1cm5zICh1aW50MjU2KVwiLFxyXG4gIFwiZnVuY3Rpb24gZ2V0QXJ0aWNsZUNvbnRyaWJ1dGlvbnModWludDI1NiBfYXJ0aWNsZUlkKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKHVpbnQyNTZbXSBtZW1vcnkpXCIsXHJcbiAgXCJmdW5jdGlvbiBnZXRVc2VyQ29udHJpYnV0aW9ucyhhZGRyZXNzIF91c2VyKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKHVpbnQyNTZbXSBtZW1vcnkpXCIsXHJcbiAgXCJmdW5jdGlvbiBoYXNDb250cmlidXRlZCh1aW50MjU2LCBhZGRyZXNzKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKGJvb2wpXCIsXHJcbiAgXCJmdW5jdGlvbiBoYXNMaWtlZCh1aW50MjU2LCBhZGRyZXNzKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKGJvb2wpXCIsXHJcbiAgXCJldmVudCBBcnRpY2xlQ3JlYXRlZCh1aW50MjU2IGluZGV4ZWQgYXJ0aWNsZUlkLCBhZGRyZXNzIGluZGV4ZWQgY3JlYXRvciwgc3RyaW5nIHRpdGxlKVwiLFxyXG4gIFwiZXZlbnQgQ29udHJpYnV0aW9uQWRkZWQodWludDI1NiBpbmRleGVkIGNvbnRyaWJ1dGlvbklkLCB1aW50MjU2IGluZGV4ZWQgYXJ0aWNsZUlkLCBhZGRyZXNzIGluZGV4ZWQgY29udHJpYnV0b3IpXCIsXHJcbiAgXCJldmVudCBDb250cmlidXRpb25MaWtlZCh1aW50MjU2IGluZGV4ZWQgY29udHJpYnV0aW9uSWQsIGFkZHJlc3MgaW5kZXhlZCBsaWtlcilcIixcclxuICBcImV2ZW50IENvbnRyaWJ1dGlvbkFwcHJvdmVkKHVpbnQyNTYgaW5kZXhlZCBjb250cmlidXRpb25JZCwgdWludDI1NiByZXdhcmQpXCIsXHJcbiAgXCJldmVudCBBcnRpY2xlQ29tcGxldGVkKHVpbnQyNTYgaW5kZXhlZCBhcnRpY2xlSWQsIHVpbnQyNTYgdG90YWxSZXdhcmRzKVwiXHJcbl07XHJcblxyXG5leHBvcnQgY29uc3QgUkVXQVJEX1RPS0VOX0FCSSA9IFtcclxuICBcImZ1bmN0aW9uIG5hbWUoKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKHN0cmluZyBtZW1vcnkpXCIsXHJcbiAgXCJmdW5jdGlvbiBzeW1ib2woKSBleHRlcm5hbCB2aWV3IHJldHVybnMgKHN0cmluZyBtZW1vcnkpXCIsXHJcbiAgXCJmdW5jdGlvbiBkZWNpbWFscygpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAodWludDgpXCIsXHJcbiAgXCJmdW5jdGlvbiB0b3RhbFN1cHBseSgpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAodWludDI1NilcIixcclxuICBcImZ1bmN0aW9uIGJhbGFuY2VPZihhZGRyZXNzIGFjY291bnQpIGV4dGVybmFsIHZpZXcgcmV0dXJucyAodWludDI1NilcIixcclxuICBcImZ1bmN0aW9uIHRyYW5zZmVyKGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSBleHRlcm5hbCByZXR1cm5zIChib29sKVwiLFxyXG4gIFwiZnVuY3Rpb24gYWxsb3dhbmNlKGFkZHJlc3Mgb3duZXIsIGFkZHJlc3Mgc3BlbmRlcikgZXh0ZXJuYWwgdmlldyByZXR1cm5zICh1aW50MjU2KVwiLFxyXG4gIFwiZnVuY3Rpb24gYXBwcm92ZShhZGRyZXNzIHNwZW5kZXIsIHVpbnQyNTYgYW1vdW50KSBleHRlcm5hbCByZXR1cm5zIChib29sKVwiLFxyXG4gIFwiZnVuY3Rpb24gdHJhbnNmZXJGcm9tKGFkZHJlc3MgZnJvbSwgYWRkcmVzcyB0bywgdWludDI1NiBhbW91bnQpIGV4dGVybmFsIHJldHVybnMgKGJvb2wpXCIsXHJcbiAgXCJmdW5jdGlvbiBtaW50KGFkZHJlc3MgdG8sIHVpbnQyNTYgYW1vdW50KSBleHRlcm5hbFwiLFxyXG4gIFwiZnVuY3Rpb24gYnVybih1aW50MjU2IGFtb3VudCkgZXh0ZXJuYWxcIixcclxuICBcImV2ZW50IFRyYW5zZmVyKGFkZHJlc3MgaW5kZXhlZCBmcm9tLCBhZGRyZXNzIGluZGV4ZWQgdG8sIHVpbnQyNTYgdmFsdWUpXCIsXHJcbiAgXCJldmVudCBBcHByb3ZhbChhZGRyZXNzIGluZGV4ZWQgb3duZXIsIGFkZHJlc3MgaW5kZXhlZCBzcGVuZGVyLCB1aW50MjU2IHZhbHVlKVwiXHJcbl07XHJcblxyXG4vLyDlt6Xlhbflh73mlbBcclxuZXhwb3J0IGNvbnN0IGZvcm1hdEFkZHJlc3MgPSAoYWRkcmVzcykgPT4ge1xyXG4gIGlmICghYWRkcmVzcykgcmV0dXJuICcnO1xyXG4gIHJldHVybiBgJHthZGRyZXNzLnNsaWNlKDAsIDYpfS4uLiR7YWRkcmVzcy5zbGljZSgtNCl9YDtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBmb3JtYXREYXRlID0gKHRpbWVzdGFtcCkgPT4ge1xyXG4gIGlmICghdGltZXN0YW1wKSByZXR1cm4gJyc7XHJcbiAgcmV0dXJuIG5ldyBEYXRlKE51bWJlcih0aW1lc3RhbXApICogMTAwMCkudG9Mb2NhbGVEYXRlU3RyaW5nKCd6aC1DTicpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGZvcm1hdERhdGVUaW1lID0gKHRpbWVzdGFtcCkgPT4ge1xyXG4gIGlmICghdGltZXN0YW1wKSByZXR1cm4gJyc7XHJcbiAgcmV0dXJuIG5ldyBEYXRlKE51bWJlcih0aW1lc3RhbXApICogMTAwMCkudG9Mb2NhbGVTdHJpbmcoJ3poLUNOJyk7XHJcbn07ICJdLCJuYW1lcyI6WyJnZXREZWZhdWx0V2FsbGV0cyIsImNvbmZpZ3VyZUNoYWlucyIsImNyZWF0ZUNvbmZpZyIsImhhcmRoYXQiLCJsb2NhbGhvc3QiLCJwdWJsaWNQcm92aWRlciIsImNvbnRyYWN0QWRkcmVzc2VzIiwiY2hhaW5zIiwicHVibGljQ2xpZW50IiwiY29ubmVjdG9ycyIsImFwcE5hbWUiLCJwcm9qZWN0SWQiLCJ3YWdtaUNvbmZpZyIsImF1dG9Db25uZWN0IiwiQ09OVFJBQ1RfQUREUkVTU0VTIiwiTU9WSUVfQVJUSUNMRSIsIm1vdmllQXJ0aWNsZSIsIlJFV0FSRF9UT0tFTiIsInJld2FyZFRva2VuIiwiTU9WSUVfQVJUSUNMRV9BQkkiLCJSRVdBUkRfVE9LRU5fQUJJIiwiZm9ybWF0QWRkcmVzcyIsImFkZHJlc3MiLCJzbGljZSIsImZvcm1hdERhdGUiLCJ0aW1lc3RhbXAiLCJEYXRlIiwiTnVtYmVyIiwidG9Mb2NhbGVEYXRlU3RyaW5nIiwiZm9ybWF0RGF0ZVRpbWUiLCJ0b0xvY2FsZVN0cmluZyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./lib/web3.js\n");

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

/***/ }),

/***/ "./contract-addresses.json":
/*!*********************************!*\
  !*** ./contract-addresses.json ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"rewardToken":"0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9","movieArticle":"0x5FC8d32690cc91D4c39d9d3abcBD16989F875707","network":"localhost"}');

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