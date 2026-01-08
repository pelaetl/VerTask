import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'setor',
    loadChildren: () => import('./pages/setor/setor.module').then( m => m.SetorPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'cadastro-administrador',
    loadChildren: () => import('./pages/cadastro-administrador/cadastro-administrador.module').then( m => m.CadastroAdministradorPageModule),
    // canActivate: [AuthGuard],
    // canLoad: [AuthGuard]
  },
  {
    path: 'cadastro-funcionario',
    loadChildren: () => import('./pages/cadastro-funcionario/cadastro-funcionario.module').then( m => m.CadastroFuncionarioPageModule),
    // canActivate: [AuthGuard],
    // canLoad: [AuthGuard]
  },
  {
    path: 'inicio',
    loadChildren: () => import('./pages/inicio/inicio.module').then( m => m.InicioPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'inicio-administrador',
    loadChildren: () => import('./pages/inicio-administrador/inicio-administrador.module').then( m => m.InicioAdministradorPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'inicio-funcionario',
    loadChildren: () => import('./pages/inicio-funcionario/inicio-funcionario.module').then( m => m.InicioFuncionarioPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'add-setor',
    loadChildren: () => import('./pages/add-setor/add-setor.module').then( m => m.AddSetorPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'add-tarefa',
    loadChildren: () => import('./pages/add-tarefa/add-tarefa.module').then( m => m.AddTarefaPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'minhas-tarefas',
    loadChildren: () => import('./pages/minhas-tarefas/minhas-tarefas.module').then( m => m.MinhasTarefasPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'todas-tarefas',
    loadChildren: () => import('./pages/todas-tarefas/todas-tarefas.module').then( m => m.TodasTarefasPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'setores',
    loadChildren: () => import('./pages/setores/setores.module').then( m => m.SetoresPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'funcionarios',
    loadChildren: () => import('./pages/funcionarios/funcionarios.module').then( m => m.FuncionariosPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'add-funcionario',
    loadChildren: () => import('./pages/add-funcionario/add-funcionario.module').then( m => m.AddFuncionarioPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'editar-perfil',
    loadChildren: () => import('./pages/editar-perfil/editar-perfil.module').then( m => m.EditarPerfilPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'editar-funcionario',
    loadChildren: () => import('./pages/editar-funcionario/editar-funcionario.module').then( m => m.EditarFuncionarioPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'detalhes-tarefa',
    loadChildren: () => import('./pages/detalhes-tarefa/detalhes-tarefa.module').then( m => m.DetalhesTarefaPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'editar-tarefa',
    loadChildren: () => import('./pages/editar-tarefa/editar-tarefa.module').then( m => m.EditarTarefaPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'forgot',
    loadChildren: () => import('./pages/forgot/forgot.module').then( m => m.ForgotPageModule)
  },
  {
    path: 'enviar-codigo',
    loadChildren: () => import('./pages/enviar-codigo/enviar-codigo.module').then( m => m.EnviarCodigoPageModule)
  },
  {
    path: 'calendario-tarefas',
    loadChildren: () => import('./pages/calendario-tarefas/calendario-tarefas.module').then( m => m.CalendarioTarefasPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'tarefa/:id/chat',
    loadChildren: () => import('./pages/chat-tarefa/chat-tarefa.module').then(m => m.ChatTarefaPageModule),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'relatorio-funcionario',
    loadChildren: () => import('./pages/relatorio-funcionario/relatorio-funcionario.module').then( m => m.RelatorioFuncionarioPageModule),
  canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'mudar-senha',
    loadChildren: () => import('./pages/mudar-senha/mudar-senha.module').then( m => m.MudarSenhaPageModule)
  },
  {
    path: 'codigo-senha',
    loadChildren: () => import('./pages/codigo-senha/codigo-senha.module').then( m => m.CodigoSenhaPageModule)
  },
  {
    path: 'empresas',
    loadChildren: () => import('./pages/empresas/empresas.module').then( m => m.EmpresasPageModule)
  },
  {
    path: 'add-empresa',
    loadChildren: () => import('./pages/add-empresa/add-empresa.module').then( m => m.AddEmpresaPageModule)
  },
  {
    path: 'add-cliente',
    loadChildren: () => import('./pages/add-cliente/add-cliente.module').then( m => m.AddClientePageModule)
  },
  {
    path: 'clientes',
    loadChildren: () => import('./pages/clientes/clientes.module').then( m => m.ClientesPageModule)
  },
  {
    path: 'relatorio-empresa',
    loadChildren: () => import('./pages/relatorio-empresa/relatorio-empresa.module').then( m => m.RelatorioEmpresaPageModule)
  },
  {
    path: 'tarefa-funcionario',
    loadChildren: () => import('./pages/tarefa-funcionario/tarefa-funcionario.module').then( m => m.TarefaFuncionarioPageModule)
  },
  {
    path: 'tarefa-empresa',
    loadChildren: () => import('./pages/tarefa-empresa/tarefa-empresa.module').then( m => m.TarefaEmpresaPageModule)
  },
  {
    path: 'editar-cliente/:id',
    loadChildren: () => import('./pages/editar-cliente/editar-cliente.module').then( m => m.EditarClientePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
