import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { useShop } from "@/context/ShopContext";
import { useLocale } from "@/hooks/useLocale";

const CartPage = () => {
  const { t } = useTranslation();
  const { pathFor } = useLocale();
  const { cart, removeFromCart, updateQuantity, cartTotal, currency } =
    useShop();

  const formatPrice = (price: number) =>
    `${currency.symbol}${price.toLocaleString()}`;

  return (
    <Layout>
      <div className="min-h-screen px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-10 text-center font-body text-2xl font-normal md:text-3xl">
            {t("cart.title")}
          </h1>

          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <p className="mb-8 text-sm font-light text-muted-foreground">
                {t("cart.empty")}
              </p>
              <Link to={pathFor("/")} className="btn-luxury-primary">
                {t("cart.continue")}
              </Link>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border border-y border-border">
                {cart.map((item) => {
                  const price =
                    item.product.onSale && item.product.salePrice
                      ? item.product.salePrice
                      : item.product.price;

                  return (
                    <li
                      key={`${item.product.id}-${item.size}`}
                      className="flex gap-4 py-6"
                    >
                      <Link
                        to={pathFor(`/product/${item.product.id}`)}
                        className="h-32 w-24 flex-shrink-0 bg-muted"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          to={pathFor(`/product/${item.product.id}`)}
                          className="mb-1 text-sm font-normal"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mb-1 text-xs text-muted-foreground">
                          {t("cart.size")}: {item.size}
                        </p>
                        <p className="text-sm">{formatPrice(price)}</p>

                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.size,
                                  item.quantity - 1,
                                )
                              }
                              className="p-1 transition-colors hover:bg-muted"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-6 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.size,
                                  item.quantity + 1,
                                )
                              }
                              className="p-1 transition-colors hover:bg-muted"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(item.product.id, item.size)
                            }
                            className="p-1 text-muted-foreground transition-colors hover:text-destructive"
                            aria-label={t("cart.remove")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm font-light">
                    {t("checkout.subtotal")}
                  </span>
                  <span className="text-sm font-normal">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <Link
                  to={pathFor("/checkout")}
                  className="btn-luxury-primary w-full text-center"
                >
                  {t("cart.checkout")}
                </Link>
                <p className="mt-4 text-center text-[10px] text-muted-foreground">
                  {t("cart.shippingNote")}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
