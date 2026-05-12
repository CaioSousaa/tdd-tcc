import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateTagModal from "./CreateTagModal";
import axios from "../lib/axios";

jest.mock("../lib/axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("RF4 - Criar Tag (Frontend)", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o formulário com os campos nome e cor", () => {
    render(<CreateTagModal onClose={jest.fn()} onSuccess={jest.fn()} />);

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cor/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar/i })).toBeInTheDocument();
  });

  it("deve chamar POST /tags com name e color ao submeter", async () => {
    mockAxios.post.mockResolvedValueOnce({
      status: 201,
      data: { id: "1", name: "Urgente", color: "#ff0000", owner: "userId", createdAt: new Date() },
    });

    const onSuccess = jest.fn();
    render(<CreateTagModal onClose={jest.fn()} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "Urgente" } });
    fireEvent.change(screen.getByLabelText(/cor/i), { target: { value: "#ff0000" } });
    fireEvent.click(screen.getByRole("button", { name: /criar/i }));

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith("/tags", {
        name: "Urgente",
        color: "#ff0000",
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("deve chamar onClose após criação bem-sucedida", async () => {
    mockAxios.post.mockResolvedValueOnce({ status: 201, data: {} });

    const onClose = jest.fn();
    render(<CreateTagModal onClose={onClose} onSuccess={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "Tag" } });
    fireEvent.change(screen.getByLabelText(/cor/i), { target: { value: "#123456" } });
    fireEvent.click(screen.getByRole("button", { name: /criar/i }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("deve exibir mensagem de erro para campos inválidos (400)", async () => {
    mockAxios.post.mockRejectedValueOnce({ response: { status: 400 } });

    render(<CreateTagModal onClose={jest.fn()} onSuccess={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /criar/i }));

    await waitFor(() => {
      expect(screen.getByText(/campos inválidos/i)).toBeInTheDocument();
    });
  });

  it("deve redirecionar para /login em caso de erro 401", async () => {
    mockAxios.post.mockRejectedValueOnce({ response: { status: 401 } });

    render(<CreateTagModal onClose={jest.fn()} onSuccess={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "Tag" } });
    fireEvent.change(screen.getByLabelText(/cor/i), { target: { value: "#ff0000" } });
    fireEvent.click(screen.getByRole("button", { name: /criar/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
