import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditTaskPage from "./page";
import axiosInstance from "@/lib/axios";
import { useRouter, useParams } from "next/navigation";

jest.mock("@/lib/axios");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
const mockPush = jest.fn();

const mockTask = {
  _id: "task123",
  title: "Tarefa existente",
  description: "Descrição atual",
  status: "todo",
  priority: "low",
  tags: [{ _id: "tag1", name: "Urgente", color: "#ff0000" }],
  dueDate: "2025-12-31T00:00:00.000Z",
  alert: "",
};

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (useParams as jest.Mock).mockReturnValue({ id: "task123" });
  jest.clearAllMocks();
});

describe("RF8 & RF9 - Editar e Excluir Tarefa (Frontend)", () => {
  it("deve carregar e pré-popular o formulário com os dados da tarefa", async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: mockTask })
      .mockResolvedValueOnce({ data: [{ _id: "tag1", name: "Urgente", color: "#ff0000" }] });

    render(<EditTaskPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Tarefa existente")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Descrição atual")).toBeInTheDocument();
      expect(screen.getByDisplayValue("todo")).toBeInTheDocument();
      expect(screen.getByDisplayValue("low")).toBeInTheDocument();
    });
  });

  it("deve chamar GET /tasks/:id ao montar a página", async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: mockTask })
      .mockResolvedValueOnce({ data: [] });

    render(<EditTaskPage />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/tasks/task123");
    });
  });

  it("deve chamar PUT /tasks/:id com os dados atualizados ao submeter", async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: mockTask })
      .mockResolvedValueOnce({ data: [] });
    mockedAxios.put = jest.fn().mockResolvedValueOnce({ data: { ...mockTask, title: "Título editado" } });

    render(<EditTaskPage />);

    await waitFor(() => screen.getByDisplayValue("Tarefa existente"));

    const titleInput = screen.getByLabelText(/título/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Título editado");

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "/tasks/task123",
        expect.objectContaining({ title: "Título editado" })
      );
    });
  });

  it("deve redirecionar para /board após edição bem-sucedida", async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: mockTask })
      .mockResolvedValueOnce({ data: [] });
    mockedAxios.put = jest.fn().mockResolvedValueOnce({ data: mockTask });

    render(<EditTaskPage />);

    await waitFor(() => screen.getByDisplayValue("Tarefa existente"));
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/board");
    });
  });

  it("deve exibir mensagem de erro quando API retornar 403", async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: mockTask })
      .mockResolvedValueOnce({ data: [] });
    mockedAxios.put = jest.fn().mockRejectedValueOnce({
      response: { status: 403, data: { message: "Sem permissão" } },
    });

    render(<EditTaskPage />);

    await waitFor(() => screen.getByDisplayValue("Tarefa existente"));
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getByText(/sem permissão/i)).toBeInTheDocument();
    });
  });

  it("deve exibir mensagem de erro quando API retornar 404", async () => {
    mockedAxios.get = jest.fn().mockRejectedValueOnce({
      response: { status: 404, data: { message: "Tarefa não encontrada" } },
    });

    render(<EditTaskPage />);

    await waitFor(() => {
      expect(screen.getByText(/tarefa não encontrada/i)).toBeInTheDocument();
    });
  });

  it("não deve submeter o formulário com título vazio", async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: mockTask })
      .mockResolvedValueOnce({ data: [] });

    render(<EditTaskPage />);

    await waitFor(() => screen.getByDisplayValue("Tarefa existente"));

    const titleInput = screen.getByLabelText(/título/i);
    await userEvent.clear(titleInput);

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockedAxios.put).not.toHaveBeenCalled();
    });
  });

  // RF9 - Excluir Tarefa
  it("deve exibir o botão de excluir na página de edição", async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: mockTask })
      .mockResolvedValueOnce({ data: [] });

    render(<EditTaskPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /excluir/i })).toBeInTheDocument();
    });
  });

  it("deve abrir modal de confirmação ao clicar em excluir", async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: mockTask })
      .mockResolvedValueOnce({ data: [] });

    render(<EditTaskPage />);

    await waitFor(() => screen.getByRole("button", { name: /excluir/i }));
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/confirmar exclusão/i)).toBeInTheDocument();
  });

  it("não deve chamar DELETE ao cancelar no modal", async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: mockTask })
      .mockResolvedValueOnce({ data: [] });

    render(<EditTaskPage />);

    await waitFor(() => screen.getByRole("button", { name: /excluir/i }));
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(mockedAxios.delete).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("deve chamar DELETE /tasks/:id ao confirmar no modal", async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: mockTask })
      .mockResolvedValueOnce({ data: [] });
    mockedAxios.delete = jest.fn().mockResolvedValueOnce({ status: 204 });

    render(<EditTaskPage />);

    await waitFor(() => screen.getByRole("button", { name: /excluir/i }));
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith("/tasks/task123");
    });
  });

  it("deve redirecionar para /board após exclusão bem-sucedida", async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: mockTask })
      .mockResolvedValueOnce({ data: [] });
    mockedAxios.delete = jest.fn().mockResolvedValueOnce({ status: 204 });

    render(<EditTaskPage />);

    await waitFor(() => screen.getByRole("button", { name: /excluir/i }));
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/board");
    });
  });
});
