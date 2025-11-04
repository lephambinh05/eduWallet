# 🎯 Quick Start - Environment Management

## Chuyển đổi môi trường

### Development (Local)

```bash
npm run env:dev
npm start
```

### Production (Server)

```bash
npm run env:prod
npm run build
```

## Các lệnh hữu ích

| Lệnh                        | Mô tả                                      |
| --------------------------- | ------------------------------------------ |
| `npm run env:dev`           | Switch sang development environment        |
| `npm run env:prod`          | Switch sang production environment         |
| `npm run generate:htaccess` | Tạo .htaccess từ .env                      |
| `npm run build`             | Build project (tự động generate .htaccess) |

## Files quan trọng

```
.env                    # File hiện tại (được copy từ .env.dev hoặc .env.prod)
.env.development       # Cấu hình cho local development
.env.production        # Cấu hình cho production server
.env.backup            # Backup tự động của .env trước đó
```

## Workflow thông thường

### Development

```bash
# 1. Switch sang development
npm run env:dev

# 2. Start development server
npm start
```

### Production Build

```bash
# 1. Switch sang production
npm run env:prod

# 2. Build (tự động generate .htaccess)
npm run build

# 3. Deploy folder build/ lên server
```

## Cấu hình URLs

### Development (.env.development)

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### Production (.env.production)

- Backend: `https://api-eduwallet.mojistudio.vn`
- Frontend: `https://eduwallet.mojistudio.vn`

## Troubleshooting

### CSP blocking resources?

```bash
# Regenerate .htaccess
npm run generate:htaccess

# Rebuild
npm run build
```

### URLs sai?

```bash
# Check .env hiện tại
cat .env | grep REACT_APP_BACKEND_URL

# Switch lại environment đúng
npm run env:dev   # hoặc env:prod
```

## 📚 Tài liệu đầy đủ

- [Environment Variables Guide](./ENVIRONMENT_VARIABLES_GUIDE.md)
- [.htaccess Generation Guide](./scripts/HTACCESS_GUIDE.md)
