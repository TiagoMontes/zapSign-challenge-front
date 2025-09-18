# ZapSign Challenge - Frontend Application

[![Angular](https://img.shields.io/badge/Angular-20.3.0-red?logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.13-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Um sistema moderno de gerenciamento de documentos Angular 20 com integração ZapSign API para assinatura eletrônica de documentos. A aplicação oferece operações CRUD abrangentes para empresas, documentos e signatários com uma interface limpa e responsiva construída com Tailwind CSS.

## 🌟 Funcionalidades

### 📊 Painel
- **Métricas gerais** - Estatísticas em tempo real de empresas, documentos e signatários
- **Atividade recente** - Últimas criações de documentos e assinaturas
- **Ações rápidas** - Acesso rápido a tarefas comuns
- **Gráficos responsivos** - Representação visual de métricas principais

### 🏢 Gerenciamento de Empresas
- **Operações CRUD** - Criar, ler, atualizar e excluir empresas
- **Gerenciamento de token API** - Armazenamento seguro e validação de tokens da API ZapSign
- **Perfis de empresa** - Informações detalhadas e configurações
- **Associação de documentos** - Visualizar todos os documentos vinculados a cada empresa

### 📄 Gerenciamento de Documentos
- **Criação de documentos** - Upload e processamento de documentos através da API ZapSign
- **Análise com IA** - Análise automática de documentos com insights e resumos
- **Visualizador de documentos** - Visualizador PDF integrado para revisão de documentos
- **Rastreamento de status** - Atualizações de status do documento em tempo real
- **Gerenciamento de signatários** - Adicionar, remover e gerenciar signatários do documento
- **Opções de download** - Acesso aos documentos originais e assinados

### ✍️ Gerenciamento de Signatários
- **Perfis de signatários** - Informações detalhadas sobre cada signatário
- **Monitoramento de status** - Acompanhar progresso e conclusão de assinaturas
- **Sincronização ZapSign** - Sincronização em tempo real com a plataforma ZapSign
- **Gerenciamento de contatos** - Validação de email e número de telefone
- **Histórico de assinaturas** - Trilha de auditoria completa das atividades do signatário

### 🎨 Interface do Usuário
- **Localização em português** - Interface completa em português brasileiro
- **Fluxos baseados em modais** - Interações suaves e não disruptivas
- **Design responsivo** - Otimizado para desktop, tablet e dispositivos móveis
- **Estética limpa** - Design moderno e profissional com Tailwind CSS
- **Acessibilidade** - Elementos de interface compatíveis com WCAG

## 🚀 Início Rápido

### Pré-requisitos

Antes de executar esta aplicação, certifique-se de ter o seguinte instalado:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Angular CLI** (v20.3.1 or higher)
- **Backend API** - Esta aplicação requer o backend ZapSign Challenge rodando. Clone e configure o repositório backend: [https://github.com/TiagoMontes/zapSign-challenge](https://github.com/TiagoMontes/zapSign-challenge)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd zapsign-challenge-front
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configuração do ambiente**

   Atualize a URL da API em `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8000/api', // URL da sua API backend
     enableLogging: true,
     enableDebugMode: true
   };
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm start
   ```
   or
   ```bash
   ng serve
   ```

5. **Acesse a aplicação**

   Abra seu navegador e navegue para `http://localhost:4200/`

## 📖 Guia de Uso

### Primeiros Passos

1. **Visão Geral do Painel**
   - Após o login, você verá o painel principal com métricas importantes
   - Use a barra lateral de navegação para acessar diferentes módulos
   - Botões de ação rápida fornecem acesso rápido a tarefas comuns

2. **Gerenciando Empresas**
   - Navegue para "Empresas" na barra lateral
   - Clique em "Nova Empresa" para criar uma nova empresa
   - Insira os detalhes da empresa e o token da API ZapSign
   - Use as ações de editar/excluir para gerenciar empresas existentes

3. **Trabalhando com Documentos**
   - Vá para a seção "Documentos"
   - Clique em "Novo Documento" para fazer upload de um novo documento
   - Selecione a empresa e faça upload do seu arquivo PDF
   - Adicione signatários fornecendo seus endereços de email
   - Monitore o status do documento e baixe versões assinadas

4. **Gerenciando Signatários**
   - Acesse "Signatários" para visualizar todos os signatários
   - Clique em qualquer signatário para ver informações detalhadas
   - Monitore o status e histórico de assinaturas
   - Sincronize com o ZapSign para atualizações em tempo real

### Funcionalidades Avançadas

#### Análise de Documentos
- Após fazer upload de um documento, clique em "Analisar" para executar análise de IA
- Visualize resumos automáticos e insights
- Identifique tópicos em falta ou informações necessárias
- Use os resultados da análise para melhorar a qualidade do documento

#### Integração ZapSign
- Todos os documentos são automaticamente processados através da API ZapSign
- Signatários recebem notificações por email com links de assinatura
- Acompanhe o progresso de assinatura em tempo real
- Baixe documentos concluídos com assinaturas digitais

## 🛠️ Development

### Project Structure

```
src/app/
├── core/                   # Core services and models
│   ├── guards/            # Route guards
│   ├── interceptors/      # HTTP interceptors
│   ├── models/           # TypeScript interfaces
│   └── services/         # API and utility services
├── features/              # Feature modules
│   ├── companies/        # Company management
│   ├── dashboard/        # Dashboard overview
│   ├── documents/        # Document management
│   └── signers/          # Signer management
├── layout/               # Application layout
│   ├── header/          # Top navigation
│   ├── navigation/      # Sidebar navigation
│   └── footer/          # Footer component
├── shared/               # Shared components
│   ├── components/      # Reusable UI components
│   ├── directives/      # Custom directives
│   └── pipes/           # Custom pipes
└── styles/              # Global styles
```

### Development Commands

```bash
# Start development server
npm start
ng serve

# Build for production
npm run build
ng build --configuration=production

# Run unit tests
npm test
ng test

# Run tests with coverage
ng test --code-coverage

# Run tests in watch mode
ng test --watch

# Generate new components
ng generate component features/component-name
ng generate service core/services/service-name
ng generate module features/module-name

# Build and analyze bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

### Code Standards

- **Angular Style Guide** - Follow official Angular coding conventions
- **External Templates** - All components use separate `.html` files
- **Tailwind CSS** - Utility-first CSS framework for styling
- **TypeScript Strict Mode** - Enabled for enhanced type safety
- **Prettier** - Automated code formatting
- **ESLint** - Code quality and consistency

### Architecture Patterns

#### Service-Based State Management
```typescript
// Example: CompanyService with BehaviorSubject
@Injectable({ providedIn: 'root' })
export class CompanyService extends BaseApiService<Company> {
  private companiesSubject = new BehaviorSubject<Company[]>([]);
  public companies$ = this.companiesSubject.asObservable();

  constructor(http: HttpClient) {
    super(http, 'companies');
  }
}
```

#### API Integration Pattern
```typescript
// All services extend BaseApiService for consistency
export abstract class BaseApiService<T> {
  protected abstract endpoint: string;

  getAll(): Observable<ApiResponse<T[]>> {
    return this.http.get<ApiResponse<T[]>>(`${this.apiUrl}/${this.endpoint}/`);
  }
}
```

#### Modal-Based UI Pattern
```typescript
// Modal service for consistent modal management
@Injectable({ providedIn: 'root' })
export class ModalService {
  openModal<T>(component: ComponentType<T>, data?: any): MatDialogRef<T> {
    return this.dialog.open(component, {
      data,
      width: '600px',
      disableClose: false
    });
  }
}
```

## 🔗 ZapSign Integration

### API Configuration

The application integrates with ZapSign's REST API for electronic document signing:

```typescript
// Company model with ZapSign API token
interface Company {
  id: number;
  name: string;
  api_token: string; // ZapSign API token
  created_at: string;
  updated_at: string;
}
```

### Document Processing Flow

1. **Document Upload** - User uploads PDF through the application
2. **ZapSign Creation** - Backend creates document in ZapSign using company's API token
3. **Signer Addition** - Signers are automatically added to the ZapSign document
4. **Email Notifications** - ZapSign sends signing invitations to signers
5. **Status Tracking** - Real-time updates on signing progress
6. **Completion** - Signed documents are available for download

### Integration Features

- **Automatic synchronization** with ZapSign platform
- **Real-time status updates** for documents and signers
- **Error handling** for API failures and token validation
- **Webhook support** for instant notifications (backend)

## 🏗️ Build and Deployment

### Production Build

```bash
# Create optimized production build
ng build --configuration=production

# Output files will be in dist/ directory
```

### Environment Configuration

Update `src/environments/environment.prod.ts` for production:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  enableLogging: false,
  enableDebugMode: false
};
```

### Performance Optimizations

- **Lazy loading** - Feature modules loaded on demand
- **OnPush change detection** - Optimized component updates
- **Tree shaking** - Unused code elimination
- **Bundle optimization** - Minimized and compressed assets
- **Service workers** - Caching for offline functionality (optional)

### Bundle Analysis

```bash
# Generate bundle statistics
ng build --stats-json

# Analyze bundle composition
npx webpack-bundle-analyzer dist/stats.json
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow the established code standards
   - Add tests for new functionality
   - Update documentation as needed
4. **Run tests and linting**
   ```bash
   npm test
   ng lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Review Guidelines

- **Code quality** - Follow Angular and TypeScript best practices
- **Test coverage** - Maintain or improve existing test coverage
- **Documentation** - Update relevant documentation
- **Performance** - Consider performance implications
- **Accessibility** - Ensure WCAG compliance

### Issue Reporting

When reporting issues, please include:

- **Environment details** (OS, Node.js version, Angular version)
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** or error messages
- **Browser information** (if UI-related)

## 📚 Additional Resources

### Documentation
- [Angular Documentation](https://angular.io/docs) - Official Angular guides
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling framework
- [RxJS Documentation](https://rxjs.dev/) - Reactive programming
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript reference

### API Integration
- [ZapSign API Documentation](https://docs.zapsign.com.br/) - Electronic signature platform
- [Django REST Framework](https://www.django-rest-framework.org/) - Backend API framework

### Tools and Libraries
- [Angular Material](https://material.angular.io/) - UI component library
- [Angular CDK](https://material.angular.io/cdk) - Component development kit
- [Angular DevTools](https://angular.io/guide/devtools) - Browser debugging extension

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- **Issues** - GitHub Issues for bug reports and feature requests
- **Documentation** - Check the [project wiki](../../wiki) for detailed guides
- **Community** - Join our development discussions

---

**Note**: The application interface is fully localized in Portuguese (Brazilian) to provide the best user experience for the target audience. All user-facing text, error messages, and documentation within the application are in Portuguese.

Built with ❤️ using Angular 20 and modern web technologies.
