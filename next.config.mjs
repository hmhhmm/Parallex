/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    'three', '@react-three/fiber', '@react-three/postprocessing', 'postprocessing',
    '@farcaster/miniapp-sdk', '@farcaster/miniapp-core', '@farcaster/mini-app-solana',
  ],
};

export default nextConfig;
