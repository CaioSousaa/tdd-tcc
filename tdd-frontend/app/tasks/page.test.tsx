// caminho: tdd-frontend/app/tasks/page.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import TasksPage from "./page";

jest.mock("@/lib/axios");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
const mockPush = jest.fn();

const makeTasks = (overrides: object[] = []) =>
  overrides.map((o, i) => ({
    id: `task-${i}`,
    title: `Tarefa ${i}`,
    description: "",
    status: "todo",
    priority: "low",
    tags: [],
    dueDate: null,
    ...o,
  }));

const mockTags = [
  { id: "tag1", name: "Backend", color: "#ff0000" },
  { id: "tag2", name: "Frontend", color: "#00ff00" },
];

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  jest.clearAllMocks();
});

describe("RF10 - Board de Tarefas em Colunas", () => {
  it("renderiza as três colunas do Kanban", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // tags

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByText(/a fazer/i)).toBeInTheDocument();
      expect(screen.getByText(/em progresso/i)).toBeInTheDocument();
      expect(screen.getByText(/conclu/i)).toBeInTheDocument();
    });
  });

  it("chama GET /tasks ao montar o componente", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(<TasksPage />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/tasks",
        expect.objectContaining({})
      );
    });
  });

  it("distribui as tarefas nas colunas corretas de acordo com o status", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: makeTasks([
        { id: "t1", title: "Pendente", status: "todo" },
        { id: "t2", title: "Em Andamento", status: "in_progress" },
        { id: "t3", title: "Finalizada", status: "done" },
      ]),
    });
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // tags

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByText("Pendente")).toBeInTheDocument();
      expect(screen.getByText("Em Andamento")).toBeInTheDocument();
      expect(screen.getByText("Finalizada")).toBeInTheDocument();
    });
  });

  it("exibe o contador de tarefas em cada coluna", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: makeTasks([
        { id: "t1", title: "Todo 1", status: "todo" },
        { id: "t2", title: "Todo 2", status: "todo" },
        { id: "t3", title: "Done 1", status: "done" },
      ]),
    });
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // tags

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("exibe estado vazio por coluna quando não há tarefas naquele status", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: makeTasks([{ id: "t1", title: "Só Aqui", status: "todo" }]),
    });
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // tags

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/nenhuma tarefa/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("redireciona para / quando GET /tasks retorna 401", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });

    render(<TasksPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});

describe("RF11 - Filtros no Board de Tarefas", () => {
  it("renderiza o select de prioridade com as opções esperadas", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] })  // GET /tasks
      .mockResolvedValueOnce({ data: [] }); // GET /tags

    render(<TasksPage />);

    await waitFor(() => {
      const select = screen.getByLabelText(/prioridade/i);
      expect(select).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /todas/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /alta/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /média/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /baixa/i })).toBeInTheDocument();
    });
  });

  it("renderiza o filtro de tags populado via GET /tags", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] })          // GET /tasks
      .mockResolvedValueOnce({ data: mockTags });   // GET /tags

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByText("Backend")).toBeInTheDocument();
      expect(screen.getByText("Frontend")).toBeInTheDocument();
    });
  });

  it("ao selecionar prioridade, chama GET /tasks com ?priority=...", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockTags })
      .mockResolvedValueOnce({ data: [] }); // re-fetch após filtro

    render(<TasksPage />);

    await waitFor(() => screen.getByLabelText(/prioridade/i));

    await userEvent.selectOptions(screen.getByLabelText(/prioridade/i), "high");

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/tasks",
        expect.objectContaining({ params: expect.objectContaining({ priority: "high" }) })
      );
    });
  });

  it("ao selecionar uma tag, chama GET /tasks com ?tags=...", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockTags })
      .mockResolvedValueOnce({ data: [] });

    render(<TasksPage />);

    await waitFor(() => screen.getByText("Backend"));

    await userEvent.click(screen.getByText("Backend"));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/tasks",
        expect.objectContaining({ params: expect.objectContaining({ tags: "tag1" }) })
      );
    });
  });

  it("combina priority e tags nos params quando ambos estão selecionados", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockTags })
      .mockResolvedValueOnce({ data: [] })  // após selecionar priority
      .mockResolvedValueOnce({ data: [] }); // após selecionar tag

    render(<TasksPage />);

    await waitFor(() => screen.getByLabelText(/prioridade/i));

    await userEvent.selectOptions(screen.getByLabelText(/prioridade/i), "medium");
    await waitFor(() => screen.getByText("Backend"));
    await userEvent.click(screen.getByText("Backend"));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/tasks",
        expect.objectContaining({
          params: expect.objectContaining({ priority: "medium", tags: "tag1" }),
        })
      );
    });
  });

  it("ao limpar o filtro de prioridade, chama GET /tasks sem o param priority", async () => {
    mockedAxios.get
      .mockResolvedValue({ data: [] });

    render(<TasksPage />);

    await waitFor(() => screen.getByLabelText(/prioridade/i));

    await userEvent.selectOptions(screen.getByLabelText(/prioridade/i), "high");
    await userEvent.selectOptions(screen.getByLabelText(/prioridade/i), "");

    await waitFor(() => {
      const lastCall = mockedAxios.get.mock.calls.at(-1);
      const params = lastCall?.[1]?.params ?? {};
      expect(params.priority).toBeUndefined();
    });
  });
});
