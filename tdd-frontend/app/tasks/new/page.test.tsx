import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import NewTaskPage from "./page";

jest.mock("@/lib/axios");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
const mockPush = jest.fn();

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  jest.clearAllMocks();
  // Default mock for tags
  mockedAxios.get.mockResolvedValue({ data: [] });
});

describe("RF7 - Criar Tarefa (Frontend)", () => {
  it("deve renderizar o formulário de criação de tarefa", () => {
    render(<NewTaskPage />);

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prioridade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de vencimento/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar/i })).toBeInTheDocument();
  });

  it("deve carregar e exibir as tags do usuário no multi-select", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { id: "tag1", name: "Urgente", color: "#ff0000" },
        { id: "tag2", name: "Frontend", color: "#00ff00" },
      ],
    });

    render(<NewTaskPage />);

    await waitFor(() => {
      expect(screen.getByText("Urgente")).toBeInTheDocument();
      expect(screen.getByText("Frontend")).toBeInTheDocument();
    });
  });

  it("deve chamar POST /tasks com os dados corretos ao submeter", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { _id: "task123", title: "Nova Tarefa" },
      status: 201,
    });

    render(<NewTaskPage />);

    await userEvent.type(screen.getByLabelText(/título/i), "Nova Tarefa");
    await userEvent.selectOptions(screen.getByLabelText(/status/i), "todo");
    await userEvent.selectOptions(screen.getByLabelText(/prioridade/i), "high");
    fireEvent.click(screen.getByRole("button", { name: /criar/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/tasks",
        expect.objectContaining({
          title: "Nova Tarefa",
          status: "todo",
          priority: "high",
        })
      );
    });
  });

  it("deve redirecionar para /tasks após criação bem-sucedida", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { _id: "task123" },
      status: 201,
    });

    render(<NewTaskPage />);

    await userEvent.type(screen.getByLabelText(/título/i), "Nova Tarefa");
    await userEvent.selectOptions(screen.getByLabelText(/status/i), "todo");
    await userEvent.selectOptions(screen.getByLabelText(/prioridade/i), "low");
    fireEvent.click(screen.getByRole("button", { name: /criar/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/tasks");
    });
  });

  it("deve exibir mensagem de erro quando a API retornar 400", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 400, data: { message: "Dados inválidos" } },
    });

    render(<NewTaskPage />);

    await userEvent.type(screen.getByLabelText(/título/i), "Tarefa Inválida");
    await userEvent.selectOptions(screen.getByLabelText(/status/i), "todo");
    await userEvent.selectOptions(screen.getByLabelText(/prioridade/i), "low");
    fireEvent.click(screen.getByRole("button", { name: /criar/i }));

    await waitFor(() => {
      expect(screen.getByText(/dados inválidos/i)).toBeInTheDocument();
    });
  });

  it("não deve submeter o formulário com título vazio", async () => {
    render(<NewTaskPage />);

    fireEvent.click(screen.getByRole("button", { name: /criar/i }));

    await waitFor(() => {
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
});
