"use client"

import { faArrowsRotate, faBadgeCheck, faExclamationTriangle, faInfo, faX } from "@fortawesome/pro-duotone-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ActionIcon } from "@mantine/core"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {

  return (
    <Sonner
      theme={"dark"}
      className="toaster group "
      toastOptions={{
        classNames: {
          title: "text-xl",
          toast:
            "group toast group-[.toaster]:bg-[rgba(1,1,1,0.35)] group-[.toaster]:backdrop-blur-xl group-[.toaster]:border-none ",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          error: "text-red-600 ",
          success: "text-green-600 ",
          warning: "text-yellow-600 ",
          info: "text-blue-600 ",
          loading: "text-blue-600",
          icon: "data-[icon]:size-5 place-self-center place-items-center justify-center align-middle",
        },

      }}
      icons={{
        error: <FontAwesomeIcon icon={faExclamationTriangle} size="xl" className="w-fit" />,
        success: <FontAwesomeIcon icon={faBadgeCheck} size="xl" className="w-fit" />,
        info: <FontAwesomeIcon icon={faInfo} size="xl" className="w-fit" />,
        warning: <FontAwesomeIcon icon={faExclamationTriangle} size="xl" className="w-fit" />,
        loading: <FontAwesomeIcon icon={faArrowsRotate} spin size="xl" className="w-fit" />,
      }}
      {...props}

      closeButton={false}
    />
  )
}


const DismissButton = ({ id }: { id: string }) => {
  return (
    <ActionIcon variant='transparent' className="absolute right-4 top-4 text-inherit  hover:text-[red] transition-colors duration-300 justify-center" onClick={() => toast.dismiss(id)}>
      <FontAwesomeIcon icon={faX} fixedWidth swapOpacity />
    </ActionIcon>
  )
}



export { Toaster, DismissButton }
