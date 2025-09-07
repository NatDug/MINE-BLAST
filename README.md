# Mine Blast Analytics Platform

A comprehensive drill and blast optimization platform for mining operations. Features design automation, data management, analysis tools, and integration capabilities similar to industry leaders like Sandvik's iSURE, Orica's BlastIQ™, and Deswik's OPDB.

## 🚀 Quick Start (Docker)

1. **Start the platform:**
   ```bash
   cd infra
   docker compose up --build -d
   ```

2. **Seed sample data (optional):**
   ```bash
   # Create default user and sample blast
   docker exec -it mineblast-backend python -m app.seed
   
   # Or seed with CSV data
   docker exec -e SAMPLE_CSV=/app/samples/sample_holes.csv -it mineblast-backend python -m app.seed
   ```

3. **Access the platform:**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs
   - Default login: `admin@example.com` / `admin123`

## 🏗️ Architecture

- **Backend**: FastAPI + PostgreSQL + SQLAlchemy
- **Frontend**: React (CRA) + TypeScript + Recharts + Leaflet
- **Infrastructure**: Docker Compose with persistent volumes

## 📊 Key Features

### Design and Planning
- **Drill Pattern Generation**: Automated hole positioning with configurable burden/spacing
- **Blast Plan Creation**: Template-based design with hole parameter management
- **CSV Import**: Bulk data upload with flexible column mapping

### Analysis and Optimization
- **Powder Factor Calculation**: Real-time explosive efficiency analysis
- **Burden/Spacing Statistics**: Min/max/average analysis with visualizations
- **Fragmentation Control**: Pattern consistency and optimization insights
- **Interactive Charts**: Burden, spacing, depth, and explosive distribution analysis

### Data Management
- **Blast Database**: Comprehensive hole and blast data storage
- **Map Layers**: GeoJSON-based mine mapping (benches, roads, boundaries)
- **User Authentication**: JWT-based security with role management

### Integration Ready
- **RESTful API**: Full CRUD operations for all entities
- **Electronic Data Transfer**: Structured data export for field equipment
- **Real-time Feedback**: Live analysis updates and parameter optimization

## 🔧 API Endpoints

### Authentication
- `POST /auth/signup` — User registration
- `POST /auth/login` — JWT token generation (OAuth2 password flow)

### Blast Management
- `GET /blasts/` — List all blasts
- `GET /blasts/{id}` — Blast details with holes
- `POST /blasts/` — Create new blast
- `POST /upload/csv` — Upload CSV data (multipart form)

### Analysis
- `GET /analysis/{id}/summary` — Burden/spacing statistics
- `GET /analysis/{id}/powder-factor` — Powder factor calculation

### Drill Planning
- `GET /drill/` — List drill plans
- `POST /drill/` — Create drill plan with grid generation

### Maps
- `GET /maps/` — List map layers
- `POST /maps/` — Add GeoJSON layer

## 📁 CSV Format

Expected columns (flexible mapping):
```csv
hole_id,burden,spacing,diameter_mm,hole_depth_m,stemming_m,explosive_density_kg_m3,explosive_column_m
A1,3.5,4.0,165,12,2,850,8
A2,3.6,4.1,165,12,2,850,8
```

## 🛠️ Development Setup

### Backend (without Docker)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Environment Variables
- Backend: Edit `backend/app/core/config.py` or set environment variables
- Frontend: Edit `frontend/src/config.ts` for API URL

## 🗺️ Map Integration

The platform supports GeoJSON layers for:
- **Bench Management**: Excavation levels and boundaries
- **Road Networks**: Haul roads and access routes  
- **Boundary Control**: Mine limits and environmental zones
- **Feature Mapping**: Equipment locations and operational areas

## 📈 Analytics Features

- **Real-time Calculations**: Powder factor, burden/spacing ratios
- **Visual Analytics**: Interactive charts and graphs
- **Optimization Insights**: Fragmentation control recommendations
- **Pattern Analysis**: Drilling accuracy and consistency metrics

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration for frontend integration
- Input validation and sanitization

## 🚀 Production Deployment

1. Update environment variables for production
2. Use production PostgreSQL instance
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Enable database migrations for schema updates

## 📋 Industry Standards

This platform implements features found in leading commercial solutions:
- **Design Automation**: Like O-Pitblast and Deswik.OPDB
- **Data Management**: Similar to BlastIQ™ data integration
- **Analysis Tools**: Comparable to iSURE optimization features
- **Integration Ready**: Electronic data transfer capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
