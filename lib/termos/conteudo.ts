export const ULTIMA_ATUALIZACAO = "04/09/2026";

export const INTRODUCAO =
  "Ao realizar seu cadastro, contratar ou utilizar os serviços disponibilizados por meio desta plataforma, o USUÁRIO declara que leu, compreendeu e concorda com os presentes Termos de Uso e com as disposições relativas ao tratamento de seus dados pessoais, nos termos da Lei nº 13.709/2018 – Lei Geral de Proteção de Dados Pessoais (LGPD).";

export type BlocoTexto = string | { itens: string[]; ordenada?: boolean };

export interface Clausula {
  numero: string;
  titulo: string;
  blocos: BlocoTexto[];
}

export const CLAUSULAS: Clausula[] = [
  {
    numero: "1ª",
    titulo: "DO OBJETO",
    blocos: [
      "1.1. A presente plataforma tem por finalidade disponibilizar ferramentas e serviços relacionados ao cadastro, organização, gestão, documentação e registro de obras e demais ativos relacionados a direitos autorais, bem como possibilitar o acompanhamento dos procedimentos contratados pelo USUÁRIO.",
      "1.2. Para a execução desses serviços, poderá ser necessário o tratamento de dados pessoais fornecidos diretamente pelo USUÁRIO ou coletados durante a utilização da plataforma.",
    ],
  },
  {
    numero: "2ª",
    titulo: "DOS DADOS COLETADOS",
    blocos: [
      "2.1. Poderão ser coletados e tratados, conforme a necessidade do serviço contratado:",
      {
        itens: [
          "nome completo;",
          "CPF ou CNPJ;",
          "documento de identificação, quando necessário;",
          "endereço;",
          "telefone;",
          "endereço de e-mail;",
          "informações profissionais;",
          "dados relacionados à obra ou criação intelectual;",
          "informações necessárias à identificação da autoria e titularidade;",
          "documentos e arquivos enviados pelo USUÁRIO;",
          "informações relacionadas ao procedimento de registro;",
          "dados de acesso e utilização da plataforma;",
          "informações necessárias para atendimento, suporte, cobrança e execução contratual.",
        ],
      },
      "2.2. A plataforma buscará limitar a coleta aos dados necessários para as finalidades informadas neste Termo.",
    ],
  },
  {
    numero: "3ª",
    titulo: "DAS FINALIDADES DO TRATAMENTO",
    blocos: [
      "3.1. O USUÁRIO autoriza o tratamento de seus dados pessoais para as seguintes finalidades:",
      {
        ordenada: true,
        itens: [
          "criação e manutenção de seu cadastro na plataforma;",
          "prestação dos serviços contratados;",
          "organização e acompanhamento de procedimentos relacionados ao registro de direitos autorais;",
          "identificação da autoria, titularidade e demais informações necessárias à proteção dos direitos do USUÁRIO;",
          "elaboração, armazenamento e gestão de documentos;",
          "comunicação com o USUÁRIO sobre seus procedimentos, solicitações, contratos, pagamentos e demais assuntos relacionados aos serviços;",
          "atendimento e suporte técnico;",
          "cumprimento de obrigações legais e regulatórias;",
          "exercício regular de direitos em processos judiciais, administrativos ou arbitrais;",
          "prevenção de fraudes, utilização indevida da plataforma e incidentes de segurança;",
          "aprimoramento dos serviços, sistemas e funcionalidades da plataforma; e",
          "demais finalidades compatíveis com a execução dos serviços contratados e com a legislação aplicável.",
        ],
      },
    ],
  },
  {
    numero: "4ª",
    titulo: "DO COMPARTILHAMENTO DE DADOS",
    blocos: [
      "4.1. O USUÁRIO declara estar ciente e, quando esta for a base legal aplicável, autoriza expressamente o compartilhamento de seus dados pessoais, sempre que necessário para a execução dos serviços contratados ou para o cumprimento das finalidades descritas neste Termo.",
      "4.2. Os dados poderão ser compartilhados, conforme a necessidade de cada procedimento, com:",
      {
        itens: [
          "empresas e profissionais contratados ou parceiros responsáveis pela execução de serviços relacionados à plataforma;",
          "prestadores de serviços de tecnologia, hospedagem, armazenamento em nuvem, segurança da informação e manutenção dos sistemas;",
          "profissionais responsáveis por atividades jurídicas, administrativas, contábeis ou operacionais relacionadas ao serviço;",
          "órgãos públicos, entidades, autarquias e instituições responsáveis por procedimentos de registro ou proteção de direitos;",
          "instituições financeiras e empresas responsáveis por processamento de pagamentos, quando necessário;",
          "fornecedores e prestadores necessários à execução do contrato;",
          "autoridades públicas, administrativas ou judiciais, sempre que houver obrigação legal ou determinação competente.",
        ],
      },
      "4.3. O compartilhamento será realizado somente na medida necessária para o cumprimento das respectivas finalidades, observados os princípios da necessidade, adequação, segurança e transparência previstos na LGPD.",
    ],
  },
  {
    numero: "5ª",
    titulo: "DO COMPARTILHAMENTO COM TERCEIROS",
    blocos: [
      "5.1. O USUÁRIO reconhece que determinados serviços poderão depender da atuação de terceiros e, consequentemente, poderá ser necessário disponibilizar determinadas informações para que o serviço seja executado.",
      "5.2. Sempre que possível e aplicável, serão compartilhados apenas os dados estritamente necessários à execução da atividade.",
      "5.3. Os terceiros que tiverem acesso aos dados deverão observar as obrigações de confidencialidade, segurança da informação e proteção de dados aplicáveis à atividade desenvolvida.",
    ],
  },
  {
    numero: "6ª",
    titulo: "DO PROCESSO DO ARMAZENAMENTO DOS DADOS",
    blocos: [
      "6.1. Os dados pessoais poderão ser armazenados em servidores próprios ou de terceiros, inclusive em ambientes de computação em nuvem, pelo período necessário ao cumprimento das finalidades para as quais foram coletados.",
      "6.2. Após o encerramento da relação contratual, determinados dados poderão permanecer armazenados pelo período necessário ao cumprimento de obrigações legais, regulatórias, contratuais ou para o exercício regular de direitos.",
    ],
  },
  {
    numero: "7ª",
    titulo: "DA SEGURANÇA DAS INFORMAÇÕES",
    blocos: [
      "7.1. A plataforma adotará medidas técnicas e administrativas razoáveis e compatíveis com a natureza dos dados tratados para proteger as informações contra acessos não autorizados, perda, destruição, alteração, divulgação ou qualquer forma de tratamento inadequado ou ilícito.",
      "7.2. Entretanto, o USUÁRIO reconhece que nenhum ambiente tecnológico está absolutamente imune a riscos de segurança.",
    ],
  },
  {
    numero: "8ª",
    titulo: "DOS DIREITOS DO TITULAR",
    blocos: [
      "8.1. Nos termos da legislação aplicável, o USUÁRIO poderá exercer seus direitos como titular de dados pessoais, incluindo, quando aplicável:",
      {
        ordenada: true,
        itens: [
          "confirmação da existência de tratamento;",
          "acesso aos dados;",
          "correção de dados incompletos, inexatos ou desatualizados;",
          "anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;",
          "portabilidade, observados os requisitos legais;",
          "informação sobre compartilhamentos realizados;",
          "informação sobre as consequências do não fornecimento de determinados dados;",
          "oposição ao tratamento realizado em determinadas hipóteses;",
          "revogação do consentimento, quando o tratamento estiver fundamentado nessa base legal; e",
          "demais direitos previstos na legislação aplicável.",
        ],
      },
      "As solicitações poderão ser encaminhadas por meio do canal de atendimento ou contato indicado pela plataforma.",
    ],
  },
  {
    numero: "9ª",
    titulo: "DA REVOGAÇÃO DO CONSENTIMENTO",
    blocos: [
      "9.1. Quando o tratamento de determinado dado estiver fundamentado no consentimento do USUÁRIO, este poderá revogá-lo a qualquer momento, mediante solicitação.",
      "9.2. A revogação não afetará a legalidade dos tratamentos realizados anteriormente com fundamento no consentimento regularmente fornecido.",
      "9.3. O USUÁRIO declara estar ciente de que a revogação poderá impossibilitar ou limitar a prestação de determinados serviços que dependam necessariamente do tratamento ou compartilhamento das informações.",
    ],
  },
  {
    numero: "10ª",
    titulo: "DOS DADOS NECESSÁRIOS À EXECUÇÃO DO SERVIÇO",
    blocos: [
      "10.1. O USUÁRIO reconhece que determinados dados são indispensáveis para a prestação dos serviços contratados.",
      "10.2. Assim, a ausência de fornecimento de informações necessárias poderá impedir, limitar ou atrasar a execução de determinados procedimentos.",
    ],
  },
  {
    numero: "11ª",
    titulo: "DA CONFIDENCIALIDADE",
    blocos: [
      "11.1. As informações relacionadas às obras, criações, documentos e demais materiais disponibilizados pelo USUÁRIO serão tratadas de forma confidencial, ressalvadas as hipóteses em que seu compartilhamento seja necessário para a execução do serviço, cumprimento de obrigação legal, exercício regular de direitos ou mediante autorização do titular.",
    ],
  },
  {
    numero: "12ª",
    titulo: "DA RESPONSABILIDADE DO USUÁRIO",
    blocos: [
      "12.1. O USUÁRIO declara que as informações e documentos fornecidos à plataforma são verdadeiros, legítimos e atualizados, responsabilizando-se pela legalidade dos materiais enviados e pelas informações prestadas.",
      "12.2. O USUÁRIO deverá comunicar qualquer alteração relevante em seus dados cadastrais.",
    ],
  },
  {
    numero: "13ª",
    titulo: "DA ACEITAÇÃO DIGITAL",
    blocos: [
      "Ao selecionar a opção Li e concordo com os Termos de Uso e Política de Privacidade, o USUÁRIO declara que: leu e compreendeu este Termo; concorda com as condições de utilização da plataforma; está ciente do tratamento de seus dados pessoais para as finalidades descritas neste documento; autoriza, quando aplicável, o compartilhamento de seus dados pessoais com terceiros, parceiros, prestadores de serviços e instituições necessárias à execução dos serviços contratados, nos limites e finalidades previstos neste Termo; está ciente de seus direitos previstos na LGPD; e reconhece que determinados tratamentos poderão ocorrer independentemente de consentimento quando houver outra base legal prevista na legislação.",
    ],
  },
  {
    numero: "14ª",
    titulo: "REGISTRO DA MANIFESTAÇÃO DE VONTADE",
    blocos: [
      "14.1. A plataforma poderá registrar informações relacionadas à aceitação deste Termo, incluindo data, horário, versão do documento aceita, identificação do usuário, endereço IP e demais informações técnicas necessárias à comprovação da manifestação de vontade e à segurança da plataforma, observada a legislação aplicável.",
    ],
  },
  {
    numero: "15ª",
    titulo: "ALTERAÇÕES DESTE TERMO",
    blocos: [
      "15.1. Este Termo poderá ser atualizado para refletir alterações legais, regulatórias, tecnológicas ou operacionais.",
      "15.2. Quando houver alteração relevante que exija nova manifestação do USUÁRIO, este será comunicado e poderá ser solicitado a realizar nova aceitação.",
    ],
  },
  {
    numero: "16ª",
    titulo: "DISPOSIÇÕES FINAIS",
    blocos: [
      "16.1. A utilização da plataforma implica a ciência e concordância do USUÁRIO com as disposições deste Termo.",
      "16.2. As disposições aqui previstas deverão ser interpretadas em conjunto com a Política de Privacidade e demais documentos aplicáveis à utilização da plataforma.",
      "16.3. Em caso de dúvidas relacionadas ao tratamento de dados pessoais, o USUÁRIO poderá entrar em contato por meio do canal oficial disponibilizado pela plataforma.",
    ],
  },
];

export const EMBASAMENTO_JURIDICO: string[] = [
  "A certificação de anterioridade disponibilizada por esta plataforma possui fundamento na legislação brasileira e nos tratados internacionais aplicáveis à proteção dos direitos autorais.",
  "A Lei nº 9.610/1998 (Lei de Direitos Autorais) estabelece a proteção das obras intelectuais e dispõe, em seu art. 18, que a proteção aos direitos autorais independe de registro. A plataforma, portanto, não cria ou concede o direito autoral, mas documenta a obra apresentada, sua identificação, a declaração de titularidade e a respectiva data de submissão.",
  "A proteção internacional encontra fundamento na Convenção de Berna para a Proteção das Obras Literárias e Artísticas, promulgada no Brasil pelo Decreto nº 75.699/1975, que estabelece princípios internacionais para a proteção dos direitos dos autores sobre suas obras literárias e artísticas.",
  "No âmbito probatório, o art. 369 do Código de Processo Civil (Lei nº 13.105/2015) assegura às partes o direito de empregar todos os meios legais e moralmente legítimos para demonstrar a verdade dos fatos. Dessa forma, a certificação poderá constituir elemento documental destinado a demonstrar a existência, o conteúdo e a anterioridade da obra apresentada.",
  "A jurisprudência do Superior Tribunal de Justiça reconhece a autonomia e a proteção dos direitos morais do autor, inclusive à luz do art. 6º bis da Convenção de Berna, reforçando a tutela jurídica da autoria e da integridade da obra. Em precedente envolvendo direitos autorais, o STJ reconheceu a proteção dos direitos morais e sua relação com a Convenção de Berna.",
  "A certificação também observa os princípios aplicáveis à produção e à apreciação da prova digital, permitindo a preservação de informações capazes de demonstrar a correspondência entre o conteúdo submetido e o registro realizado na plataforma.",
  "Assim, o certificado emitido pela plataforma constitui elemento de prova de anterioridade e de titularidade declarada, podendo ser apresentado em procedimentos administrativos, negociações ou processos judiciais, sempre sujeito à apreciação da autoridade competente e ao conjunto probatório produzido no caso concreto.",
  "O tratamento dos dados pessoais e das informações fornecidas pelo usuário observará a Lei nº 13.709/2018 (LGPD) e demais normas aplicáveis.",
  "A finalidade da certificação é proporcionar ao titular uma evidência documental, temporal e verificável da obra apresentada, fortalecendo sua capacidade de demonstrar anterioridade, autoria ou titularidade declarada em eventual controvérsia.",
];

export const CONTROLADOR = {
  nome: "Revollution Ideas Brand",
  cnpj: "44.289.335/0001-47",
  emailPrivacidade: "[E-MAIL DE CONTATO A DEFINIR]",
  dpo: "Heloize Melo da Silva Camargo",
  endereco: "Rua Alameda Rio Negro, 911, edifício Ômega, 7º Andar, sala 708, Alphaville, Barueri/SP, CEP 06454-000",
};
