const axios = require('axios');
const FormData = require('form-data');

class IPFSService {
  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
    this.pinataGatewayUrl = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/';
    
    if (!this.pinataApiKey || !this.pinataSecretApiKey) {
      console.warn('⚠️ Pinata API keys not configured. IPFS features will be disabled.');
    }
  }

  // 检查是否已配置
  isConfigured() {
    return !!(this.pinataApiKey && this.pinataSecretApiKey);
  }

  // 上传JSON数据到IPFS
  async uploadJSON(data, metadata = {}) {
    if (!this.isConfigured()) {
      throw new Error('IPFS service not configured. Please add Pinata API keys to your .env.local file.');
    }

    try {
      const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
      
      const response = await axios.post(url, {
        pinataContent: data,
        pinataMetadata: {
          name: metadata.name || 'MovieWrite Article',
          ...metadata
        },
        pinataOptions: {
          cidVersion: 0
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretApiKey
        }
      });

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        url: this.getIPFSUrl(response.data.IpfsHash)
      };
    } catch (error) {
      console.error('IPFS upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  // 上传文件到IPFS
  async uploadFile(file, metadata = {}) {
    if (!this.isConfigured()) {
      throw new Error('IPFS service not configured');
    }

    try {
      const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
      const formData = new FormData();
      
      formData.append('file', file);
      
      const metadataString = JSON.stringify({
        name: metadata.name || file.name || 'MovieWrite Media',
        ...metadata
      });
      formData.append('pinataMetadata', metadataString);
      
      const optionsString = JSON.stringify({
        cidVersion: 0
      });
      formData.append('pinataOptions', optionsString);

      const response = await axios.post(url, formData, {
        maxBodyLength: 'Infinity',
        headers: {
          ...formData.getHeaders(),
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretApiKey
        }
      });

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        url: this.getIPFSUrl(response.data.IpfsHash)
      };
    } catch (error) {
      console.error('IPFS file upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }

  // 从IPFS获取内容
  async fetchFromIPFS(ipfsHash) {
    try {
      const url = this.getIPFSUrl(ipfsHash);
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('IPFS fetch error:', error.message);
      throw new Error(`Failed to fetch from IPFS: ${error.message}`);
    }
  }

  // 获取IPFS URL
  getIPFSUrl(ipfsHash) {
    return `${this.pinataGatewayUrl}${ipfsHash}`;
  }

  // 取消固定（从Pinata删除）
  async unpin(ipfsHash) {
    if (!this.isConfigured()) {
      throw new Error('IPFS service not configured');
    }

    try {
      const url = `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`;
      
      const response = await axios.delete(url, {
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretApiKey
        }
      });

      return {
        success: true,
        message: 'Content unpinned successfully'
      };
    } catch (error) {
      console.error('IPFS unpin error:', error.response?.data || error.message);
      throw new Error(`Failed to unpin from IPFS: ${error.message}`);
    }
  }

  // 列出已固定的内容
  async listPinned(options = {}) {
    if (!this.isConfigured()) {
      throw new Error('IPFS service not configured');
    }

    try {
      const url = 'https://api.pinata.cloud/data/pinList';
      
      const queryParams = new URLSearchParams({
        status: 'pinned',
        pageLimit: options.pageLimit || 10,
        pageOffset: options.pageOffset || 0,
        ...options
      });

      const response = await axios.get(`${url}?${queryParams}`, {
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretApiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('IPFS list error:', error.response?.data || error.message);
      throw new Error(`Failed to list pinned content: ${error.message}`);
    }
  }
}

// 导出单例实例
const ipfsService = new IPFSService();

module.exports = ipfsService;