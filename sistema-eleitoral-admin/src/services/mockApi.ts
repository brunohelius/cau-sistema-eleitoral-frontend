// Mock API Service for Electoral System
// This provides realistic mock data and simulates API calls

// Types
export interface Election {
  id: string;
  nome: string;
  descricao: string;
  dataInicio: Date;
  dataFim: Date;
  status: 'Planejamento' | 'Ativa' | 'Concluida' | 'Cancelada';
  tipoEleicao: string;
  totalChapas: number;
  totalVotos: number;
  eleitoresAptos: number;
}

export interface Ticket {
  id: string;
  nome: string;
  numero: string;
  slogan: string;
  eleicaoId: string;
  eleicaoNome: string;
  status: 'Registrada' | 'Aprovada' | 'Rejeitada' | 'Em Analise';
  dataRegistro: Date;
  responsavel: string;
  membros: Member[];
  totalVotos?: number;
}

export interface Member {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  cargo: 'Presidente' | 'Vice-Presidente' | 'Secretario' | 'Tesoureiro' | 'Conselheiro';
  situacao: 'Aprovado' | 'Pendente' | 'Rejeitado';
  documentos: string[];
}

export interface Complaint {
  id: string;
  numero: string;
  titulo: string;
  descricao: string;
  tipo: 'Conduta' | 'Eleitoral' | 'Administrativa';
  status: 'Aberta' | 'Em Analise' | 'Julgada' | 'Arquivada';
  dataAbertura: Date;
  denunciante: string;
  denunciado: string;
  relator?: string;
  instancia: '1ª Instância' | '2ª Instância';
  prazoDefesa?: Date;
  anexos: string[];
}

export interface Impugnation {
  id: string;
  numero: string;
  titulo: string;
  descricao: string;
  tipo: 'Chapa' | 'Membro' | 'Processo';
  status: 'Aberta' | 'Em Analise' | 'Julgada' | 'Arquivada';
  dataAbertura: Date;
  impugnante: string;
  impugnado: string;
  relator?: string;
  fundamentacao: string;
  anexos: string[];
}

export interface Commission {
  id: string;
  nome: string;
  tipo: 'Eleitoral' | 'Disciplinar' | 'Recursal';
  uf: string;
  dataInicio: Date;
  dataFim: Date;
  status: 'Ativa' | 'Inativa' | 'Suspensa';
  presidente: string;
  membros: CommissionMember[];
  processos: number;
}

export interface CommissionMember {
  id: string;
  nome: string;
  cargo: 'Presidente' | 'Vice-Presidente' | 'Membro' | 'Secretario';
  dataInicio: Date;
  dataFim?: Date;
  status: 'Ativo' | 'Inativo';
}

// Mock Data
const mockElections: Election[] = [
  {
    id: '1',
    nome: 'Eleições CAU/BR 2024',
    descricao: 'Eleições para Conselho de Arquitetura e Urbanismo do Brasil',
    dataInicio: new Date('2024-03-15'),
    dataFim: new Date('2024-04-15'),
    status: 'Ativa',
    tipoEleicao: 'Ordinária',
    totalChapas: 5,
    totalVotos: 1250,
    eleitoresAptos: 2500,
  },
  {
    id: '2',
    nome: 'Eleições CAU/SP 2024',
    descricao: 'Eleições regionais do estado de São Paulo',
    dataInicio: new Date('2024-05-01'),
    dataFim: new Date('2024-05-31'),
    status: 'Planejamento',
    tipoEleicao: 'Regional',
    totalChapas: 3,
    totalVotos: 0,
    eleitoresAptos: 1200,
  },
];

const mockTickets: Ticket[] = [
  {
    id: '1',
    nome: 'Chapa Renovação CAU',
    numero: '01',
    slogan: 'Inovação e Transparência para o CAU',
    eleicaoId: '1',
    eleicaoNome: 'Eleições CAU/BR 2024',
    status: 'Aprovada',
    dataRegistro: new Date('2024-02-01'),
    responsavel: 'João Silva',
    totalVotos: 450,
    membros: [
      {
        id: '1',
        nome: 'João Silva',
        cpf: '123.456.789-00',
        email: 'joao@email.com',
        cargo: 'Presidente',
        situacao: 'Aprovado',
        documentos: ['RG', 'CPF', 'Comprovante CAU'],
      },
      {
        id: '2',
        nome: 'Maria Santos',
        cpf: '987.654.321-00',
        email: 'maria@email.com',
        cargo: 'Vice-Presidente',
        situacao: 'Aprovado',
        documentos: ['RG', 'CPF', 'Comprovante CAU'],
      },
    ],
  },
];

const mockComplaints: Complaint[] = [
  {
    id: '1',
    numero: 'DEN/2024/001',
    titulo: 'Denúncia contra irregularidades na chapa 02',
    descricao: 'Relato de possível irregularidade na composição da chapa eleitoral',
    tipo: 'Eleitoral',
    status: 'Em Analise',
    dataAbertura: new Date('2024-02-10'),
    denunciante: 'Ana Silva',
    denunciado: 'Chapa 02 - Renovação CAU',
    relator: 'Dr. Carlos Santos',
    instancia: '1ª Instância',
    prazoDefesa: new Date('2024-03-10'),
    anexos: ['documento1.pdf', 'evidencia.jpg'],
  },
];

const mockImpugnations: Impugnation[] = [
  {
    id: '1',
    numero: 'IMP/2024/001',
    titulo: 'Impugnação da candidatura de João Silva',
    descricao: 'Questionamento sobre a elegibilidade do candidato',
    tipo: 'Membro',
    status: 'Em Analise',
    dataAbertura: new Date('2024-02-15'),
    impugnante: 'Pedro Costa',
    impugnado: 'João Silva',
    relator: 'Dr. Ana Paula',
    fundamentacao: 'Lei 12.378/2010, Art. 25',
    anexos: ['impugnacao.pdf'],
  },
];

const mockCommissions: Commission[] = [
  {
    id: '1',
    nome: 'Comissão Eleitoral CAU/BR',
    tipo: 'Eleitoral',
    uf: 'DF',
    dataInicio: new Date('2024-01-01'),
    dataFim: new Date('2024-12-31'),
    status: 'Ativa',
    presidente: 'Dr. Carlos Santos',
    processos: 15,
    membros: [
      {
        id: '1',
        nome: 'Dr. Carlos Santos',
        cargo: 'Presidente',
        dataInicio: new Date('2024-01-01'),
        status: 'Ativo',
      },
    ],
  },
];

// API Simulation Functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiService {
  // Elections
  static async getElections(): Promise<Election[]> {
    await delay(500);
    return mockElections;
  }

  static async getElection(id: string): Promise<Election | null> {
    await delay(300);
    return mockElections.find(e => e.id === id) || null;
  }

  static async createElection(election: Omit<Election, 'id'>): Promise<Election> {
    await delay(800);
    const newElection: Election = {
      ...election,
      id: Date.now().toString(),
    };
    mockElections.push(newElection);
    return newElection;
  }

  // Tickets
  static async getTickets(): Promise<Ticket[]> {
    await delay(500);
    return mockTickets;
  }

  static async getTicket(id: string): Promise<Ticket | null> {
    await delay(300);
    return mockTickets.find(t => t.id === id) || null;
  }

  static async createTicket(ticket: Omit<Ticket, 'id'>): Promise<Ticket> {
    await delay(800);
    const newTicket: Ticket = {
      ...ticket,
      id: Date.now().toString(),
    };
    mockTickets.push(newTicket);
    return newTicket;
  }

  static async validateTicketMember(ticketId: string, memberId: string, approved: boolean): Promise<void> {
    await delay(500);
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (ticket) {
      const member = ticket.membros.find(m => m.id === memberId);
      if (member) {
        member.situacao = approved ? 'Aprovado' : 'Rejeitado';
      }
    }
  }

  // Complaints
  static async getComplaints(): Promise<Complaint[]> {
    await delay(500);
    return mockComplaints;
  }

  static async getComplaint(id: string): Promise<Complaint | null> {
    await delay(300);
    return mockComplaints.find(c => c.id === id) || null;
  }

  static async createComplaint(complaint: Omit<Complaint, 'id' | 'numero'>): Promise<Complaint> {
    await delay(800);
    const newComplaint: Complaint = {
      ...complaint,
      id: Date.now().toString(),
      numero: `DEN/2024/${(mockComplaints.length + 1).toString().padStart(3, '0')}`,
    };
    mockComplaints.push(newComplaint);
    return newComplaint;
  }

  // Impugnations
  static async getImpugnations(): Promise<Impugnation[]> {
    await delay(500);
    return mockImpugnations;
  }

  static async getImpugnation(id: string): Promise<Impugnation | null> {
    await delay(300);
    return mockImpugnations.find(i => i.id === id) || null;
  }

  static async createImpugnation(impugnation: Omit<Impugnation, 'id' | 'numero'>): Promise<Impugnation> {
    await delay(800);
    const newImpugnation: Impugnation = {
      ...impugnation,
      id: Date.now().toString(),
      numero: `IMP/2024/${(mockImpugnations.length + 1).toString().padStart(3, '0')}`,
    };
    mockImpugnations.push(newImpugnation);
    return newImpugnation;
  }

  // Commissions
  static async getCommissions(): Promise<Commission[]> {
    await delay(500);
    return mockCommissions;
  }

  static async getCommission(id: string): Promise<Commission | null> {
    await delay(300);
    return mockCommissions.find(c => c.id === id) || null;
  }

  static async createCommission(commission: Omit<Commission, 'id'>): Promise<Commission> {
    await delay(800);
    const newCommission: Commission = {
      ...commission,
      id: Date.now().toString(),
    };
    mockCommissions.push(newCommission);
    return newCommission;
  }

  // File Upload Simulation
  static async uploadFile(file: File): Promise<string> {
    await delay(1000);
    return `uploaded/${file.name}`;
  }

  // Reports
  static async getReportData(reportId: string): Promise<any> {
    await delay(800);
    
    // Mock different report types
    const reportData = {
      '1': {
        title: 'Relatório de Votação',
        chartData: [
          { name: 'Chapa 01', votos: 450, cor: '#0066CC' },
          { name: 'Chapa 02', votos: 380, cor: '#FF6B35' },
          { name: 'Chapa 03', votos: 420, cor: '#2E8B57' },
        ],
        tableData: [
          { chapa: 'Chapa 01', presidente: 'João Silva', votos: 450, percentual: 36.0 },
          { chapa: 'Chapa 02', presidente: 'Maria Santos', votos: 380, percentual: 30.4 },
          { chapa: 'Chapa 03', presidente: 'Pedro Costa', votos: 420, percentual: 33.6 },
        ],
        totalVotos: 1250,
      },
    };

    return reportData[reportId as keyof typeof reportData] || reportData['1'];
  }

  // Dashboard Statistics
  static async getDashboardStats(): Promise<any> {
    await delay(600);
    return {
      totalElections: mockElections.length,
      activeElections: mockElections.filter(e => e.status === 'Ativa').length,
      totalTickets: mockTickets.length,
      approvedTickets: mockTickets.filter(t => t.status === 'Aprovada').length,
      totalComplaints: mockComplaints.length,
      pendingComplaints: mockComplaints.filter(c => c.status === 'Em Analise').length,
      totalImpugnations: mockImpugnations.length,
      activeCommissions: mockCommissions.filter(c => c.status === 'Ativa').length,
      recentActivity: [
        {
          id: '1',
          type: 'election',
          description: 'Nova eleição criada: Eleições CAU/BR 2024',
          timestamp: new Date(),
        },
        {
          id: '2', 
          type: 'complaint',
          description: 'Denúncia DEN/2024/001 em análise',
          timestamp: new Date(Date.now() - 3600000),
        },
      ],
    };
  }
}

export default MockApiService;